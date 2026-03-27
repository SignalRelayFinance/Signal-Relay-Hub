#!/usr/bin/env python3
"""Build a Markdown digest from normalized SignalFoundry events."""
from __future__ import annotations

import argparse
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, Iterable, List

BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"


def build_digest(records: List[Dict], stamp: str) -> str:
    lines = [
        f"# SignalFoundry Digest — {stamp}",
        f"_Generated {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}_",
        "",
    ]

    by_tag: Dict[str, List[Dict]] = {}
    for r in records:
        tag = r.get("primary_tag", "general")
        by_tag.setdefault(tag, []).append(r)

    tag_order = ["funding", "regulatory", "pricing", "security", "product", "partnership", "talent", "marketing", "general"]

    for tag in tag_order:
        events = by_tag.get(tag, [])
        if not events:
            continue
        lines.append(f"## {tag.title()}")
        for e in sorted(events, key=lambda x: x.get("impact_score", 1), reverse=True):
            title = e.get("title", "Untitled")
            link = e.get("link", "")
            company = e.get("company", "")
            sentiment = e.get("sentiment", "neutral")
            impact = e.get("impact_score", 1)
            lines.append(f"- **[{company}]** [{title}]({link}) _(impact: {impact}/5, {sentiment})_")
        lines.append("")

    return "\n".join(lines)


def run_digest(stamp: str | None = None) -> Path:
    stamp = stamp or datetime.utcnow().strftime("%Y%m%d")
    in_path = DATA_DIR / f"normalized-events-{stamp}.jsonl"
    out_path = DATA_DIR / f"digest-{stamp}.md"

    if not in_path.exists():
        raise FileNotFoundError(f"No normalized events at {in_path}")

    records = []
    with in_path.open("r", encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if line:
                try:
                    records.append(json.loads(line))
                except json.JSONDecodeError:
                    pass

    digest = build_digest(records, stamp)

    with out_path.open("w", encoding="utf-8") as fh:
        fh.write(digest)

    print(f"Digest written -> {out_path}")
    return out_path


def main(argv: Iterable[str] | None = None) -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--stamp", type=str, default=None)
    args = parser.parse_args(list(argv) if argv is not None else None)
    run_digest(stamp=args.stamp)


if __name__ == "__main__":
    main()
