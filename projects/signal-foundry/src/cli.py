#!/usr/bin/env python3
"""Unified CLI for SignalFoundry workflows."""
from __future__ import annotations

import argparse
import shutil
from pathlib import Path
from typing import Iterable

BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"
SAMPLE_DIR = DATA_DIR / "sample"


def cmd_collect(args: argparse.Namespace) -> None:
    from collector import run_collection
    run_collection(limit=args.limit, stamp=args.stamp)


def cmd_normalize(args: argparse.Namespace) -> None:
    from normalizer import run_normalizer
    run_normalizer(stamp=args.stamp)


def cmd_digest(args: argparse.Namespace) -> None:
    from digest import run_digest
    run_digest(stamp=args.stamp)


def cmd_push(args: argparse.Namespace) -> None:
    from supabase_push import push_events
    from datetime import datetime
    stamp = args.stamp or datetime.utcnow().strftime("%Y%m%d")
    path = DATA_DIR / f"normalized-events-{stamp}.jsonl"
    push_events(path, dry_run=args.dry_run)


def cmd_pipeline(args: argparse.Namespace) -> None:
    from collector import run_collection
    from normalizer import run_normalizer
    from digest import run_digest
    run_collection(limit=args.limit, stamp=args.stamp)
    run_normalizer(stamp=args.stamp)
    run_digest(stamp=args.stamp)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="SignalFoundry CLI")
    subparsers = parser.add_subparsers(dest="command", required=True)

    collect = subparsers.add_parser("collect", help="Run feed collector")
    collect.add_argument("--limit", type=int, default=0)
    collect.add_argument("--stamp", type=str, default=None)
    collect.set_defaults(func=cmd_collect)

    normalize = subparsers.add_parser("normalize", help="Normalize collected events")
    normalize.add_argument("--stamp", type=str, default=None)
    normalize.set_defaults(func=cmd_normalize)

    digest_cmd = subparsers.add_parser("digest", help="Build digest output")
    digest_cmd.add_argument("--stamp", type=str, default=None)
    digest_cmd.set_defaults(func=cmd_digest)

    push = subparsers.add_parser("push", help="Push normalized events to Supabase")
    push.add_argument("--stamp", type=str, default=None)
    push.add_argument("--dry-run", action="store_true")
    push.set_defaults(func=cmd_push)

    pipeline = subparsers.add_parser("pipeline", help="Run full pipeline (collect+normalize+digest)")
    pipeline.add_argument("--limit", type=int, default=0)
    pipeline.add_argument("--stamp", type=str, default=None)
    pipeline.set_defaults(func=cmd_pipeline)

    return parser


def main(argv: Iterable[str] | None = None) -> None:
    parser = build_parser()
    args = parser.parse_args(list(argv) if argv is not None else None)
    args.func(args)


if __name__ == "__main__":
    main()
