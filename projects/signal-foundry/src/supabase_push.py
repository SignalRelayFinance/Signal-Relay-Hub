#!/usr/bin/env python3
"""Push normalized SignalFoundry events into Supabase.

Reads from a normalized JSONL file and upserts into the `sf_events` table.
Skips duplicates by upserting on `id` (SHA1 of link+published+company).

Requires env vars:
  SUPABASE_URL        — your Supabase project URL
  SUPABASE_SERVICE_KEY — service role key (never the anon key)
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path
from typing import Any, Dict, List

try:
    from supabase import create_client, Client  # type: ignore
except ImportError:
    raise SystemExit("supabase-py not installed. Run: pip install supabase")

BATCH_SIZE = 100  # Supabase recommends batching large inserts


def get_client() -> "Client":
    url = os.environ.get("SUPABASE_URL", "").strip()
    key = os.environ.get("SUPABASE_SERVICE_KEY", "").strip()
    if not url or not key:
        raise SystemExit(
            "Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables."
        )
    return create_client(url, key)


def load_jsonl(path: Path) -> List[Dict[str, Any]]:
    if not path.exists():
        raise FileNotFoundError(f"No file at {path}")
    records = []
    with path.open("r", encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if line:
                try:
                    records.append(json.loads(line))
                except json.JSONDecodeError:
                    pass
    return records


def map_record(r: Dict[str, Any]) -> Dict[str, Any]:
    """Map a normalized event dict to the sf_events table schema."""
    record = {
        "id": r.get("id"),
        "company": r.get("company"),
        "source": r.get("source"),
        "title": r.get("title"),
        "link": r.get("link"),
        "summary": r.get("summary"),
        "published": r.get("published"),
        "primary_tag": r.get("primary_tag", "general"),
        "tags": r.get("tags", []),
        "sentiment": r.get("sentiment", "neutral"),
        "impact_score": r.get("impact_score", 1),
        "confidence": r.get("confidence", "low"),
        "fetched_at": r.get("fetched_at"),
        "normalized_at": r.get("normalized_at"),
    }
    # Forex Factory economic calendar fields
    if r.get("event_type") == "economic_calendar":
        record["event_type"] = r.get("event_type")
        record["currency"] = r.get("currency")
        record["impact"] = r.get("impact")
        record["impact_color"] = r.get("impact_color")
        record["forecast"] = r.get("forecast")
        record["previous_value"] = r.get("previous")
        record["actual_value"] = r.get("actual")
    return record


def push_events(path: Path, dry_run: bool = False) -> int:
    records = load_jsonl(path)
    if not records:
        print(f"No records found in {path}")
        return 0

    rows = [map_record(r) for r in records if r.get("id")]
    print(f"Loaded {len(rows)} records from {path}")

    if dry_run:
        print("[dry-run] Skipping Supabase push.")
        return len(rows)

    client = get_client()
    pushed = 0

    for i in range(0, len(rows), BATCH_SIZE):
        batch = rows[i : i + BATCH_SIZE]
        result = (
            client.table("sf_events")
            .upsert(batch, on_conflict="id")
            .execute()
        )
        if hasattr(result, "error") and result.error:
            print(f"Supabase error on batch {i}: {result.error}", file=sys.stderr)
        else:
            pushed += len(batch)
            print(f"  Pushed batch {i // BATCH_SIZE + 1} ({len(batch)} rows)")

    print(f"Done. {pushed}/{len(rows)} events pushed to Supabase.")
    return pushed


if __name__ == "__main__":
    import argparse
    from datetime import datetime

    parser = argparse.ArgumentParser(description="Push normalized events to Supabase")
    parser.add_argument("--stamp", type=str, default=None, help="YYYYMMDD stamp")
    parser.add_argument("--dry-run", action="store_true", help="Skip actual push")
    args = parser.parse_args()

    stamp = args.stamp or datetime.utcnow().strftime("%Y%m%d")
    base_dir = Path(__file__).resolve().parents[1]
    data_dir = base_dir / "data"
    normalized_path = data_dir / f"normalized-events-{stamp}.jsonl"

    push_events(normalized_path, dry_run=args.dry_run)
