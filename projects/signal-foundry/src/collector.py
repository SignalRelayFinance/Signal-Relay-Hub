#!/usr/bin/env python3
"""SignalFoundry collector.

Reads feeds/companies.yaml and pulls RSS sources into a normalized JSONL file.
"""
from __future__ import annotations

import argparse
import json
from datetime import datetime, timedelta
import re 
from email.utils import parsedate_to_datetime
from pathlib import Path
from typing import Any, Dict, Iterable, List

import feedparser  # type: ignore
import yaml  # type: ignore

BASE_DIR = Path(__file__).resolve().parents[1]
FEEDS_PATH = BASE_DIR / "feeds" / "companies.yaml"
DATA_DIR = BASE_DIR / "data"
USER_AGENT = "SignalFoundryCollector/0.1"
MAX_AGE_DAYS = 90
SEC_MAX_AGE_HOURS = 72

SEC_FEEDS = [
    {
        "label": "8-K",
        "url": "https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent&type=8-K&count=80&output=atom",
    },
    {
        "label": "SC 13D",
        "url": "https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent&type=SC+13D&count=80&output=atom",
    },
    {
        "label": "SC 13G",
        "url": "https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent&type=SC+13G&count=80&output=atom",
    },
    {
        "label": "Form 4",
        "url": "https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent&type=4&count=80&output=atom",
    },
]

SEC_TITLE_RE = re.compile(r"^(?P<form>[A-Za-z0-9\- ]+)\s*-\s*(?P<company>.+?)\s*\((?P<cik>\d+)\)")


class CollectorError(RuntimeError):
    pass


def load_feeds() -> List[Dict[str, Any]]:
    with FEEDS_PATH.open("r", encoding="utf-8") as handle:
        data = yaml.safe_load(handle)
    return data.get("companies", [])


def fetch_rss(url: str) -> List[Dict[str, Any]]:
    feed = feedparser.parse(url, agent=USER_AGENT)
    entries: List[Dict[str, Any]] = []
    for entry in feed.entries:
        entries.append({
            "title": entry.get("title"),
            "link": entry.get("link"),
            "summary": re.sub(r'<[^>]+>', '', entry.get("summary") or "").strip(),
            "published": entry.get("published"),
        })
    return entries


def is_recent(published: str | None) -> bool:
    """Return True if the entry was published within MAX_AGE_DAYS days."""
    if not published:
        return True  # no date = include it
    try:
        pub_date = parsedate_to_datetime(published).replace(tzinfo=None)
        return (datetime.utcnow() - pub_date).days <= MAX_AGE_DAYS
    except Exception:
        return True  # unparseable date = include it


def is_recent_sec(published: str | None) -> bool:
    if not published:
        return True
    try:
        pub_date = parsedate_to_datetime(published).replace(tzinfo=None)
        return (datetime.utcnow() - pub_date) <= timedelta(hours=SEC_MAX_AGE_HOURS)
    except Exception:
        return True


def parse_sec_title(title: str) -> Dict[str, str | None]:
    match = SEC_TITLE_RE.match(title.strip())
    if not match:
        return {"form": None, "company": None, "cik": None}
    return match.groupdict()


def normalize_sec_entry(entry: Dict[str, Any], label: str) -> Dict[str, Any]:
    info = parse_sec_title(entry.get("title", ""))
    company = info.get("company") or entry.get("company") or "Unknown"
    cik = info.get("cik")
    form = info.get("form") or label
    summary = re.sub(r'<[^>]+>', '', entry.get("summary") or "").strip()
    return {
        "company": company,
        "source": f"SEC {form}",
        "title": entry.get("title"),
        "link": entry.get("link"),
        "summary": summary,
        "published": entry.get("published"),
        "tag": "regulatory",
        "fetched_at": datetime.utcnow().isoformat(),
        "form_type": form,
        "cik": cik,
    }


def collect_sec_filings(handle, count: int, limit: int) -> int:
    added = 0
    for feed in SEC_FEEDS:
        parsed = feedparser.parse(feed["url"], agent=USER_AGENT)
        for entry in parsed.entries:
            if limit and (count + added) >= limit:
                return added
            if not is_recent_sec(entry.get("published")):
                continue
            record = normalize_sec_entry(entry, feed["label"])
            handle.write(json.dumps(record) + "\n")
            added += 1
    if added:
        print(f"Added {added} SEC filings")
    return added


def normalize_event(company: str, source: str, entry: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "company": company,
        "source": source,
        "title": entry.get("title"),
        "link": entry.get("link"),
        "summary": entry.get("summary"),
        "published": entry.get("published"),
        "tag": classify(entry.get("title", ""), entry.get("summary", "")),
        "fetched_at": datetime.utcnow().isoformat(),
    }


KEYWORDS = {
    "pricing": ["pricing", "price", "fee", "plan"],
    "product": ["launch", "update", "feature", "release"],
    "funding": ["raise", "series", "investment"],
    "regulatory": ["sec", "compliance", "law", "policy"],
}


def classify(title: str, summary: str) -> str:
    blob = f"{title} {summary}".lower()
    for tag, needles in KEYWORDS.items():
        if any(word in blob for word in needles):
            return tag
    return "general"


def run_collection(limit: int = 0, stamp: str | None = None) -> Path:
    feeds = load_feeds()
    if not feeds:
        raise CollectorError("No feeds configured.")

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    stamp = stamp or datetime.utcnow().strftime("%Y%m%d")
    out_path = DATA_DIR / f"events-{stamp}.jsonl"
    count = 0

    with out_path.open("a", encoding="utf-8") as handle:
        for company in feeds:
            name = company["name"]
            for url in company.get("feeds", {}).get("blogs", []):
                for entry in fetch_rss(url):
                    if not is_recent(entry.get("published")):
                        continue
                    record = normalize_event(name, url, entry)
                    handle.write(json.dumps(record) + "\n")
                    count += 1
                    if limit and count >= limit:
                        break
                if limit and count >= limit:
                    break
            if limit and count >= limit:
                break

        if not limit or count < limit:
            sec_added = collect_sec_filings(handle, count, limit)
            count += sec_added

    print(f"Saved {count} events -> {out_path}")
    return out_path


def main(argv: Iterable[str] | None = None) -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--stamp", type=str, default=None)
    args = parser.parse_args(list(argv) if argv is not None else None)
    run_collection(limit=args.limit, stamp=args.stamp)


if __name__ == "__main__":
    main()
