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
          <Link className="rounded-md bg-black px-3 py-2 text-white hover:bg-black/90" href="/login">
            Get started
          </Link>
        </nav>
      </header>

      <main className="mt-20">
        <div className="inline-flex items-center rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-500 mb-6">
          TradingView covers SEC filings. We cover everything else too.
        </div>

        <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
          Multi-source intel for fintech operators and traders.
        </h1>

        <p className="mt-5 max-w-2xl text-pretty text-base text-neutral-600">
          Signal Relay Hub monitors AI labs, fintech companies, regulators, and SEC filings —
          then pushes what matters to you via Telegram, email, or API. Not a dashboard you have
          to remember to check.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/login" className="rounded-md bg-black px-4 py-2 text-white hover:bg-black/90">
            Start free trial
          </Link>
          <Link href="/feed" className="rounded-md border border-neutral-300 px-4 py-2 hover:bg-neutral-50">
            View live feed
          </Link>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border p-5">
            <div className="text-sm font-medium text-neutral-400 mb-2">Multi-source</div>
            <div className="font-semibold mb-1">Beyond SEC filings</div>
            <div className="text-sm text-neutral-600">
              OpenAI, Anthropic, Stripe, Revolut, regulators, and 15+ more sources in one feed —
              not just 8-K filings.
            </div>
          </div>
          <div className="rounded-lg border p-5">
            <div className="text-sm font-medium text-neutral-400 mb-2">Push delivery</div>
            <div className="font-semibold mb-1">Comes to you</div>
            <div className="text-sm text-neutral-600">
              Signals delivered via Telegram or email the moment they drop. No dashboard
              to babysit.
            </div>
          </div>
          <div className="rounded-lg border p-5">
            <div className="text-sm font-medium text-neutral-400 mb-2">API access</div>
            <div className="font-semibold mb-1">Built for developers</div>
            <div className="text-sm text-neutral-600">
              Self-serve API key via Stripe checkout. Pipe signals directly into your
              own stack, alerts, or models.
            </div>
          </div>
        </div>

        <div className="mt-16 rounded-lg border p-6 sm:p-8">
          <div className="text-sm font-medium text-neutral-400 mb-4">Who it's for</div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <div className="font-semibold mb-1">Fintech operators</div>
              <div className="text-sm text-neutral-600">
                Track competitor pricing moves, product launches, funding rounds, and regulatory
                shifts before they hit the news cycle.
              </div>
            </div>
            <div>
              <div className="font-semibold mb-1">Traders and analysts</div>
              <div className="text-sm text-neutral-600">
                SEC filings, 8-K alerts, and market-moving signals from the companies that
                matter — with context, not just raw filings.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <Link href="/login" className="rounded-md bg-black px-5 py-2.5 text-white hover:bg-black/90">
            Get started — £45/month
          </Link>
          <span className="text-sm text-neutral-500">Cancel anytime. API key provisioned instantly.</span>
        </div>
      </main>

      <footer className="mt-auto pt-16 text-xs text-neutral-500">
        © 2026 Signal Relay Hub. Built for fintech operators and traders.
      </footer>
    </div>
  );
}
