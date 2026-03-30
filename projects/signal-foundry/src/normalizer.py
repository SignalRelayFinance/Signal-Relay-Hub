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
}

SENTIMENT_RULES = {
    "positive": ["record", "growth", "milestone", "best", "win", "improved", "expanding"],
    "negative": ["decline", "loss", "issue", "problem", "delay", "drop", "lawsuit"],
}

IMPACT_BASE = {
    "pricing": 4, "product": 3, "funding": 5, "regulatory": 5,
    "talent": 2, "security": 4, "partnership": 3, "marketing": 2, "general": 1,
}


@dataclass
class NormalizedEvent:
    record: Dict
    tags: List[str]
    sentiment: str
    impact_score: int
    confidence: str

    def as_dict(self) -> Dict:
        enriched = dict(self.record)
        enriched.update({
            "id": event_id(enriched),
            "tags": self.tags,
            "primary_tag": self.tags[0] if self.tags else "general",
            "sentiment": self.sentiment,
            "impact_score": self.impact_score,
            "confidence": self.confidence,
            "normalized_at": datetime.utcnow().isoformat(),
        })
        return enriched
        
def strip_html(text: str) -> str:
    return re.sub(r'<[^>]+>', '', text).strip()

def event_id(record: Dict) -> str:
    basis = record.get("link") or record.get("title") or ""
    stamp = record.get("published") or ""
    payload = f"{basis}|{stamp}|{record.get('company', '')}".encode("utf-8", "ignore")
    return hashlib.sha1(payload).hexdigest()


def detect_tags(text: str) -> List[str]:
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


def score_impact(tags: Sequence[str], text: str) -> int:
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
        blob = " ".join(filter(None, [record.get("title") or "", record.get("summary") or ""])).lower()
        tags = detect_tags(blob)
        normalized.append(NormalizedEvent(
            record, tags, detect_sentiment(blob), score_impact(tags, blob), confidence_from_record(record)
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
