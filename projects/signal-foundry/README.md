# SignalFoundry Collector

RSS-based competitive intelligence collector. Pulls blog feeds, normalizes events, scores them, builds digests, and pushes to Supabase.

## Setup

```bash
pip install -r requirements.txt
```

## Usage

```bash
cd src

# Run full pipeline (collect → normalize → digest)
python cli.py pipeline

# Push normalized events to Supabase
python cli.py push

# Individual steps
python cli.py collect
python cli.py normalize
python cli.py digest
```

### Flash SEC collector

The collector now pulls high-impact SEC filings (8-K, SC 13D/13G, Form 4) via
EDGAR's current-filings Atom feeds. Filings are normalized into the same
`events-YYYYMMDD.jsonl` file, tagged as `regulatory`, and flow through the
existing normalizer/digest/push steps. No extra command is required—`collect`
and `pipeline` automatically append SEC filings after processing the company
RSS feeds.

## Environment variables (for Supabase push)

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
```

## Adding feeds

Edit `feeds/companies.yaml` to add new companies and RSS URLs.

## GitHub Actions

The pipeline runs automatically every 6 hours via `.github/workflows/signalfoundry.yml`.
Set these repository secrets so the workflow + Telegram notifier can run end-to-end:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `PROVISION_WEBHOOK_SECRET`
- `TELEGRAM_BOT_TOKEN`
