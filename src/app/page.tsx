/* eslint-disable react/no-unescaped-entities */
import Link from 'next/link';

const highlights = [
  { label: 'Sources', value: '28+', caption: 'AI labs, fintechs, regulators, SEC filings' },
  { label: 'Latency', value: '<2 min', caption: 'From filing to Telegram or email' },
  { label: 'API ready', value: '100%', caption: 'Self-serve keys via Stripe checkout' },
];

const features = [
  {
    title: 'Multi-source coverage',
    copy: 'AI labs, fintech product updates, regulator dockets, and SEC filings combine into one stream.',
  },
  {
    title: 'Push delivery',
    copy: 'Telegram, email, and webhook automation keep the team in sync without dashboard refreshes.',
  },
  {
    title: 'Operator + trader modes',
    copy: 'Filters for ops, risk, and trading desks so everyone sees signals mapped to their playbook.',
  },
  {
    title: 'Built-in API + webhooks',
    copy: 'Stripe checkout provisions real API keys instantly. Pipe data into your models or alerting stack.',
  },
];

const personas = [
  {
    title: 'Fintech operators',
    copy: 'Catch competitor launches, pricing moves, and regulatory heat before the press release drops.',
  },
  {
    title: 'Traders & analysts',
    copy: 'Flash SEC alerts plus context from AI + fintech sources to size impact within minutes.',
  },
];

const logos = ['Stripe', 'Anthropic', 'DeepMind', 'OpenAI', 'Revolut', 'Coinbase'];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral-950 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(67,56,202,0.25),_transparent_55%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10 sm:py-14">
        <header className="flex items-center justify-between">
          <div className="text-lg font-semibold">Signal Relay Hub</div>
          <nav className="flex items-center gap-4 text-sm text-neutral-300">
            <Link className="hover:text-white" href="/feed">
              Live feed
            </Link>
            <Link className="hover:text-white" href="/digests">
              Digest archive
            </Link>
            <Link className="rounded-full bg-white px-4 py-2 text-neutral-900 hover:bg-neutral-200" href="/login">
              Get started
            </Link>
          </nav>
        </header>

        <main className="mt-14 flex flex-col gap-16 pb-20">
          <section className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-wide text-neutral-200">
                Flash SEC + multi-source intel
              </span>
              <h1 className="mt-6 text-balance text-4xl font-semibold leading-tight sm:text-5xl">
                Your fingertip on filings, fintech launches, and regulator moves.
              </h1>
              <p className="mt-5 text-base text-neutral-300">
                Signal Relay Hub watches AI labs, fintechs, and regulators in real time. When a filing
                or pricing change hits, we push it to Telegram, email, and your API stack within minutes.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/login"
                  className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-neutral-900 hover:bg-neutral-200"
                >
                  Start free trial — £45/mo
                </Link>
                <Link
                  href="/feed"
                  className="rounded-full border border-white/40 px-5 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10"
                >
                  View live feed
                </Link>
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-neutral-900/70 to-neutral-800/40 p-6 shadow-xl">
              <div className="rounded-2xl border border-white/10 bg-black/50 p-6">
                <div className="text-sm font-medium text-white/60">Live signal preview</div>
                <div className="mt-4 space-y-4 text-sm text-white/80">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-wide text-purple-200">SEC 8-K</div>
                    <p className="mt-1 font-medium text-white">Stripe files 8-K — new interchange pilot with EU acquiring banks.</p>
                    <p className="mt-1 text-white/60">Pushed to Ops desk · 58 seconds ago</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-wide text-amber-200">Pricing move</div>
                    <p className="mt-1 font-medium text-white">Revolut drops FX markup on business tiers.</p>
                    <p className="mt-1 text-white/60">Telegram + API delivered · 2 minutes ago</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-wide text-sky-200">AI regulation</div>
                    <p className="mt-1 font-medium text-white">UK FCA outlines AI model accountability requirements for fintechs.</p>
                    <p className="mt-1 text-white/60">Email summary scheduled for AM stand-up</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="text-xs uppercase tracking-[0.2em] text-white/50">Trusted by operators + traders at</div>
            <div className="mt-4 flex flex-wrap gap-6 text-sm text-white/70">
              {logos.map((logo) => (
                <span key={logo} className="font-medium tracking-tight">
                  {logo}
                </span>
              ))}
            </div>
          </section>

          <section className="grid gap-6 sm:grid-cols-3">
            {highlights.map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="text-xs uppercase tracking-wide text-white/60">{item.label}</div>
                <div className="mt-2 text-3xl font-semibold">{item.value}</div>
                <p className="mt-1 text-sm text-white/70">{item.caption}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-semibold">Why teams use Signal Relay Hub</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {features.map((feature) => (
                  <div key={feature.title} className="rounded-xl border border-white/10 bg-black/30 p-4">
                    <div className="text-sm font-medium text-white">{feature.title}</div>
                    <p className="mt-2 text-sm text-white/70">{feature.copy}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-violet-900/30 to-indigo-900/10 p-6">
              <h3 className="text-xl font-semibold">Who it's built for</h3>
              <div className="mt-6 space-y-5">
                {personas.map((persona) => (
                  <div key={persona.title} className="rounded-xl border border-white/10 bg-black/30 p-4">
                    <div className="text-sm font-medium text-white">{persona.title}</div>
                    <p className="mt-2 text-sm text-white/70">{persona.copy}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-xl border border-dashed border-white/30 p-4 text-sm text-white/70">
                <div className="font-medium text-white">Push delivery</div>
                Telegram, email, and webhook sequences ship with pre-built playbooks for ops, risk,
                and research teams.
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:flex sm:items-center sm:justify-between">
            <div>
              <div className="text-sm uppercase tracking-wide text-white/60">Pricing</div>
              <div className="mt-2 text-3xl font-semibold">£45 / month</div>
              <p className="mt-2 text-sm text-white/70">API key provisioned instantly · cancel anytime</p>
            </div>
            <div className="mt-6 flex flex-col gap-3 text-sm text-white/80 sm:mt-0">
              <div className="flex items-center gap-2">
                <span className="text-green-300">●</span> Flash SEC alerts (8-K, 13D/G, Form 4)
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-300">●</span> Multi-source feed + digest archive
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-300">●</span> Telegram, email, webhook automations
              </div>
            </div>
            <Link
              href="/login"
              className="mt-6 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-neutral-900 hover:bg-neutral-200 sm:mt-0"
            >
              Get started
            </Link>
          </section>
        </main>

        <footer className="mt-auto border-t border-white/5 pt-6 text-xs text-white/60">
          © {new Date().getFullYear()} Signal Relay Hub · Built for fintech operators & traders.
        </footer>
      </div>
    </div>
  );
}
