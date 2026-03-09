# Payload Examples

Local development fixtures that back the `/api/*` routes when a real collector
service is unavailable.

- `events.json` — recent competitive events + `next_cursor` metadata.
- `digest.json` — latest Markdown digest plus structured sections. You can add
  dated overrides named `digest-YYYY-MM-DD.json` to emulate historical fetches.
- `highlights.json` — catalyst summaries for the social drip queue.
- `status.json` — collector / notifier heartbeat payload.

Set `SIGNAL_SAMPLE_DIR` in `.env.local` to point at a different directory if you
want to swap these files without touching the repo defaults.
