#!/usr/bin/env python3
"""Normalize SignalFoundry events with heuristic tagging + scoring."""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Dict, Iterable, List, Sequence

BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"

CATEGORY_RULES: Dict[str, Sequence[str]] = {
    "pricing": ["pricing", "price", "fee", "plan", "discount", "cost"],
    "product": ["launch", "update", "feature", "release", "ship", "integration", "beta", "ai"],
    "funding": ["raise", "series", "investment", "funding", "seed", "venture"],
    "regulatory": ["sec", "compliance", "law", "policy", "regulator", "court"],
    "talent": ["hire", "hiring", "joined", "cto", "team", "executive"],
    "security": ["breach", "vulnerability", "incident", "outage", "downtime"],
    "partnership": ["partner", "partnership", "collaborat", "alliance"],
    "marketing": ["campaign", "promo", "webinar", "event", "conference"],
    "insider_trading": ["form 4", "insider", "beneficial owner", "stock purchase", "stock sale", "equity award"],
    "ownership_change": ["sc 13d", "sc 13g", "schedule 13", "activist", "stake", "ownership"],
    "merger_acquisition": ["merger", "acquisition", "acqui", "takeover", "buyout", "deal close", "transaction complete"],
    "management": ["officer", "director", "ceo", "cfo", "coo", "president", "appointed", "resigned", "departure", "succession"],
    "earnings": ["earnings", "revenue", "quarterly", "annual report", "10-k", "10-q", "eps", "profit", "loss"],
}

SEC_FORM_RULES = [
    {
        "forms": ["form 4", "form4"],
        "tag": "insider_trading",
        "impact": 4,
        "label": "Insider Trading",
    },
    {
        "forms": ["sc 13d", "sc 13g", "schedule 13d", "schedule 13g"],
        "tag": "ownership_change",
        "impact": 4,
        "label": "Ownership Change",
    },
    {
        "forms": ["s-1", "s1", "ipo", "initial public offering"],
        "tag": "funding",
        "impact": 5,
        "label": "IPO Filing",
    },
    {
        "forms": ["10-k", "10k", "annual report"],
        "tag": "earnings",
        "impact": 4,
        "label": "Annual Report",
    },
    {
        "forms": ["10-q", "10q", "quarterly report"],
        "tag": "earnings",
        "impact": 3,
        "label": "Quarterly Report",
    },
]

SEC_8K_KEYWORDS = [
    (["merger", "acquisition", "acqui", "takeover", "buyout", "business combination"], "merger_acquisition", 5),
    (["officer", "director", "ceo", "cfo", "coo", "appointed", "resigned", "departure", "succession", "president"], "management", 4),
    (["bankruptcy", "chapter 11", "insolvency", "liquidat"], "regulatory", 5),
    (["breach", "vulnerability", "cybersecurity", "hack", "incident", "outage"], "security", 5),
    (["dividend", "buyback", "repurchase", "special distribution"], "funding", 3),
    (["partnership", "joint venture", "alliance", "collaborat"], "partnership", 3),
]

SENTIMENT_RULES = {
    "positive": ["record", "growth", "milestone", "best", "win", "improved", "expanding", "appointed", "launched", "agreement"],
    "negative": ["decline", "loss", "issue", "problem", "delay", "drop", "lawsuit", "resigned", "breach", "bankruptcy", "investigation"],
}

IMPACT_BASE = {
    "pricing": 4, "product": 3, "funding": 5, "regulatory": 5,
    "talent": 2, "security": 4, "partnership": 3, "marketing": 2,
    "insider_trading": 4, "ownership_change": 4, "merger_acquisition": 5,
    "management": 4, "earnings": 4, "general": 1,
}


def classify_sec_event(title: str, summary: str, source: str) -> tuple[str, int] | None:
    """Classify SEC filings by form type and content. Returns (tag, impact) or None."""
    text = f"{title} {summary}".lower()
    source_lower = (source or "").lower()

    # Only apply to SEC sources
    if "sec" not in source_lower and "edgar" not in source_lower and "sec.gov" not in source_lower:
        return None

    # Check form type rules first
    for rule in SEC_FORM_RULES:
        if any(form in text for form in rule["forms"]):
            return rule["tag"], rule["impact"]

    # 8-K specific classification
    if "8-k" in text or "8k" in text:
        for keywords, tag, impact in SEC_8K_KEYWORDS:
            if any(kw in text for kw in keywords):
                return tag, impact
        # Generic 8-K
        return "regulatory", 3

    return None


@dataclass
class NormalizedEvent:
    record: Dict
    tags: List[str]
    sentiment: str
    impact_score: int
    confidence: str

    def as_dict(self) -> Dict:
        enriched = dict(self.record)
        enriched["summary"] = strip_html(enriched.get("summary") or "")
        enriched.update({
            "id": event_id(enriched),
            "tags": self.tags,
            "primary_tag": self.tags[0] if self.tags else "general",
            "normalized_at": datetime.utcnow().isoformat(),
        })
        if not enriched.get("sentiment"):
            enriched["sentiment"] = self.sentiment
        if not enriched.get("impact_score"):
            enriched["impact_score"] = self.impact_score
        if not enriched.get("confidence"):
            enriched["confidence"] = self.confidence
        for field in ["event_type", "currency", "impact", "impact_color", "forecast", "previous", "actual"]:
            if field in self.record:
                enriched[field] = self.record[field]
        return enriched


def strip_html(text: str) -> str:
    return re.sub(r'<[^>]+>', '', text).strip()


def event_id(record: Dict) -> str:
    basis = record.get("link") or record.get("title") or ""
    stamp = record.get("published") or ""
    payload = f"{basis}|{stamp}|{record.get('company', '')}".encode("utf-8", "ignore")
    return hashlib.sha1(payload).hexdigest()


def detect_tags(text: str, source: str = "", title: str = "", summary: str = "") -> List[str]:
    # Try SEC classification first
    sec_result = classify_sec_event(title, summary, source)
    if sec_result:
        tag, _ = sec_result
        return [tag]

    tags = []
    for tag, needles in CATEGORY_RULES.items():
        if any(re.search(rf"\b{re.escape(word)}", text) for word in needles):
            tags.append(tag)
    return tags or ["general"]


def detect_sentiment(text: str) -> str:
    lowered = text.lower()
    for sentiment, needles in SENTIMENT_RULES.items():
        if any(word in lowered for word in needles):
            return sentiment
    return "neutral"


def score_impact(tags: Sequence[str], text: str, source: str = "", title: str = "", summary: str = "") -> int:
    # Use SEC-specific impact if applicable
    sec_result = classify_sec_event(title, summary, source)
    if sec_result:
        _, impact = sec_result
        return impact

    base = max(IMPACT_BASE.get(tag, 1) for tag in tags) if tags else 1
    modifiers = sum([
        any(w in text for w in ("record", "historic", "first")),
        any(w in text for w in ("delay", "halt", "breach")),
    ])
    return min(5, max(1, base + modifiers))


def confidence_from_record(record: Dict) -> str:
    fields = [record.get("summary"), record.get("published"), record.get("link")]
    completeness = sum(1 for f in fields if f)
    return ["low", "low", "medium", "high"][completeness]


def normalize_records(records: List[Dict]) -> List[Dict]:
    seen = set()
    normalized = []
    for record in records:
        if not record:
            continue
        rid = event_id(record)
        if rid in seen:
            continue
        seen.add(rid)

        title = strip_html(record.get("title") or "")
        summary = strip_html(record.get("summary") or "")
        source = record.get("source") or record.get("company") or ""
        blob = f"{title} {summary}".lower()

        tags = detect_tags(blob, source=source, title=title, summary=summary)
        impact = score_impact(tags, blob, source=source, title=title, summary=summary)
        sentiment = detect_sentiment(blob)

        normalized.append(NormalizedEvent(
            record, tags, sentiment, impact, confidence_from_record(record)
        ).as_dict())
    return normalized


def run_normalizer(stamp: str | None = None) -> Path:
    stamp = stamp or datetime.utcnow().strftime("%Y%m%d")
    in_path = DATA_DIR / f"events-{stamp}.jsonl"
    out_path = DATA_DIR / f"normalized-events-{stamp}.jsonl"

    if not in_path.exists():
        raise FileNotFoundError(f"No events file at {in_path}")

    records = []
    with in_path.open("r", encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if line:
                try:
                    records.append(json.loads(line))
                except json.JSONDecodeError:
                    pass

    normalized = normalize_records(records)

    with out_path.open("w", encoding="utf-8") as fh:
        for record in normalized:
            fh.write(json.dumps(record) + "\n")

    print(f"Normalized {len(normalized)} records -> {out_path}")
    return out_path


def main(argv: Iterable[str] | None = None) -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--stamp", type=str, default=None)
    args = parser.parse_args(list(argv) if argv is not None else None)
    run_normalizer(stamp=args.stamp)


if __name__ == "__main__":
    main()
