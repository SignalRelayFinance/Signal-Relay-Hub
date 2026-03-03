# Signal Relay Hub — API Spec (Draft)

## Auth
- Header: `X-Relay-Key: <tenant_api_key>`
- Keys issued per tenant (Operator vs Trader tiers). Trader keys unlock `/highlights` + `/webhooks`.

## Endpoints

### `GET /api/events`
Returns normalized competitive events (SignalFoundry + Flash SEC) sorted by ingest time.

Params:
- `limit` (int, default 50, max 200)
- `since` (ISO8601) — only events newer than timestamp
- `tag` (string) — filter by primary tag (`pricing`, `product`, `funding`, `regulatory`, `talent`, `security`, `partnership`, `marketing`)

Response snippet:
```json
{
  "events": [
    {
      "id": "7b3c4c0c...",
      "company": "Stripe",
      "source": "rss",
      "source_url": "https://stripe.com/blog/...",
      "title": "Stripe launches modular pricing",
      "summary": "Enterprise plans now support per-seat billing...",
      "tags": ["pricing", "product"],
      "primary_tag": "pricing",
      "impact_score": 4,
      "sentiment": "positive",
      "fetched_at": "2026-03-03T17:45:12Z",
      "published_at": "2026-03-03T17:30:00Z"
    }
  ],
  "next_cursor": "20260303T174512Z"
}
```

### `GET /api/digest`
Fetches Markdown + structured JSON for the latest daily digest.

Params: `date` (YYYY-MM-DD, optional; defaults to today).

Response snippet:
```json
{
  "date": "2026-03-03",
  "markdown": "# SignalFoundry Daily Digest...",
  "events": [...],
  "filings": [...]
}
```

### `GET /api/status`
Health + telemetry for collectors and notifiers.

Response snippet:
```json
{
  "collectors": {
    "flash_sec": {"last_run": "2026-03-03T19:55:00Z", "success": true, "new_records": 1},
    "signal_foundry": {"last_run": "2026-03-03T19:50:00Z", "success": true, "new_records": 6}
  },
  "notifier": {"last_digest": "2026-03-03T19:00:05Z", "telegram": "sent", "email": "skipped"}
}
```

### `GET /api/highlights`
Returns top N catalysts for social drip + notifications.

Params: `limit` (default 3), `min_score` (default 3.0).

Response snippet:
```json
{
  "highlights": [
    {
      "ticker": "COIN",
      "title": "Coinbase hires ex-CFTC attorney as Chief Policy Officer",
      "catalyst": "regulatory",
      "score": 5.5,
      "summary": "New hire will spearhead Washington liaison office...",
      "link": "https://www.sec.gov/...",
      "suggested_copy": "COIN recruiting ex-CFTC leadership. Regulatory offense starting now."
    }
  ]
}
```

### `POST /api/webhooks/provision` (Trader/Agency tier)
Used by Stripe webhook to create tenants + delivery channels.

Payload:
```json
{
  "email": "ops@example.com",
  "plan": "trader",
  "telegram_chat_id": "5606598685",
  "watchlist": ["Stripe", "Coinbase"],
  "custom_tags": ["ai", "payments"],
  "notes": "Pilot client from referral"
}
```

Response:
```json
{"tenant_id": "tenant_123", "api_key": "relay_sk_...", "status": "provisioned"}
```

---
*Status: draft. Back-end implementation + examples in progress.*
