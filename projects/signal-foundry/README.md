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

## Environment variables (for Supabase push)

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
```

## Adding feeds

Edit `feeds/companies.yaml` to add new companies and RSS URLs.

## GitHub Actions

The pipeline runs automatically every 6 hours via `.github/workflows/signalfoundry.yml`.
Add `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` as GitHub repository secrets.
