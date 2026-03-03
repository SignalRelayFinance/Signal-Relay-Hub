import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-14">
      <header className="flex items-center justify-between">
        <div className="text-lg font-semibold">Signal Relay Hub</div>
        <nav className="flex items-center gap-4 text-sm">
          <Link className="hover:underline" href="/login">
            Login
          </Link>
          <Link className="rounded-md bg-black px-3 py-2 text-white hover:bg-black/90" href="/feed">
            Open dashboard
          </Link>
        </nav>
      </header>

      <main className="mt-14">
        <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
          Real-time SEC + competitive signals, with digests and self-serve access.
        </h1>
        <p className="mt-5 max-w-2xl text-pretty text-base text-neutral-600">
          Multi-tenant dashboard + landing page that surfaces live signals, keeps an archive of
          digests, and lets customers self-serve via Stripe checkout + API keys.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="rounded-md bg-black px-4 py-2 text-white hover:bg-black/90"
          >
            Get started
          </Link>
          <Link
            href="/feed"
            className="rounded-md border border-neutral-300 px-4 py-2 hover:bg-neutral-50"
          >
            View live feed
          </Link>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border p-4">
            <div className="font-medium">Live feed</div>
            <div className="mt-1 text-sm text-neutral-600">Streaming events + highlights.</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="font-medium">Digest archive</div>
            <div className="mt-1 text-sm text-neutral-600">History + searchable summaries.</div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="font-medium">Self-serve</div>
            <div className="mt-1 text-sm text-neutral-600">
              Stripe checkout → provision API key.
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-auto pt-16 text-xs text-neutral-500">
        MVP scaffold — auth via Supabase, payments via Stripe.
      </footer>
    </div>
  );
}
