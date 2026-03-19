# Signal Relay Hub

Multi-tenant dashboard + landing page that shows real-time SEC/competitive signals, delivers digests, and lets customers self-serve via Stripe checkout + API keys.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind
- Supabase (auth: magic link for MVP)
- Stripe Checkout + webhook (provision stub)

## Local dev

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000

### Sample data

The dashboard ships with JSON fixtures under `docs/payload-examples`. The API routes
(`GET /api/events`, `/api/digest`, `/api/highlights`, `/api/status`) read from those files
via `src/lib/signal-store.ts` so the UI renders without a live backend.

Set `SIGNAL_SAMPLE_DIR=/absolute/path/to/your-fixtures` in `.env.local` if you want to
swap in custom payloads.

## Pages (MVP scaffold)

- `/` Landing page
- `/login` Supabase magic-link login
- `/feed` Live feed (pulls from `/api/events` + `/api/highlights`)
- `/digests` Digest archive (pulls from `/api/digest`)
- `/drip-queue` Social drip queue (mock table for now)
- `/settings` Account settings + billing button

## Environment variables

See `.env.example`.

Minimum for auth:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Signal API wiring:

- `NEXT_PUBLIC_SIGNAL_API_BASE_URL` (optional; if blank, uses same-origin `/api/*` stubs)

Stripe (for checkout + webhooks):

- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_ID`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL` (optional; used for redirect URLs)

Provision protection (optional):

- `PROVISION_WEBHOOK_SECRET`

## Stripe flow (current)

- Settings page links to `GET /api/stripe/checkout` which redirects to Stripe Checkout.
- Stripe sends webhook to `POST /api/webhooks/stripe`.
- On `checkout.session.completed`, we call `POST /api/webhooks/provision` (stub) to generate an API key.

> TODO: store tenants + keys in Supabase + show real key in `/settings`.

## API spec

Tyler mentioned specs/payload examples live at:
`projects/signal-foundry/docs/API_SPEC.md`

That file is not in this repo yet — add/copy it into `docs/` when available.
