/* eslint-disable react/no-unescaped-entities */
'use client';

import Link from 'next/link';
import { useState } from 'react';

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

const tiers = [
  {
    name: 'Free',
    price: '£0',
    period: '',
    color: 'border-white/20',
    badge: '',
    badgeColor: '',
    labelColor: 'text-white/50',
    features: [
      'View live feed',
      'Browse digest archive',
      'Markets page with live prices',
      'Economic calendar',
    ],
    locked: [
      'Telegram push alerts',
      'API access',
      'Flash SEC filings',
      'Market pair impact analysis',
      'Trade direction predictions',
    ],
    cta: 'Sign in free',
    ctaHref: '/login',
    ctaStyle: 'border border-white/20 text-white hover:bg-white/10',
  },
  {
    name: 'Pro',
    price: '£45',
    period: '/month',
    color: 'border-sky-400/40 bg-sky-400/5',
    badge: 'Most popular',
    badgeColor: 'bg-sky-400 text-neutral-900',
    labelColor: 'text-sky-300',
    features: [
      'Everything in Free',
      'Flash SEC alerts — 8-K, 13D/G, Form 4',
      '28+ live sources — AI labs, fintechs, regulators',
      'Telegram push alerts with tag filtering',
      'AI market pair impact analysis',
      'Self-serve API key for your stack',
      'Full digest archive history',
      'Traders Circle chat + trade ideas',
      'Pro badge in community',
    ],
    locked: [
      'AI trade direction predictions',
      'Daily AI briefing',
      'Email digest delivery',
    ],
    cta: 'Get started — £45/mo',
    ctaHref: '/plans',
    ctaStyle: 'bg-white text-neutral-900 hover:bg-neutral-200',
  },
  {
    name: 'Elite',
    price: '£150',
    period: '/month',
    color: 'border-amber-400/40 bg-amber-400/5',
    badge: 'Best for traders',
    badgeColor: 'bg-amber-400 text-neutral-900',
    labelColor: 'text-amber-300',
    features: [
      'Everything in Pro',
      'AI trade predictions with confidence score',
      'Signals 30 min before Pro tier',
      'Daily AI briefing at 7am',
      'Pre-event alerts 15 min before red folder events',
      'Post-event AI debrief + updated trade setups',
      'Weekly macro outlook every Sunday',
      'AI Trading Assistant — scalp/swing/risk reports',
      'Traders Circle Elite badge + trade ideas',
      'Unlimited API calls',
    ],
    locked: [],
    cta: 'Get Elite — £150/mo',
    ctaHref: '/plans',
    ctaStyle: 'bg-amber-400 text-neutral-900 hover:bg-amber-300',
  },
];

const reasons = [
  {
    icon: '⚡',
    title: 'Speed over opinion',
    copy: 'We push signals within minutes of a filing dropping. Trading mentors post hours later — after the move already happened.',
  },
  {
    icon: '📡',
    title: '28+ verified sources',
    copy: 'Not one person\'s calls. SEC EDGAR, central banks, AI labs, fintech companies, crypto news, forex events — all automated.',
  },
  {
    icon: '🤖',
    title: 'AI analysis, not vibes',
    copy: 'Every signal is analysed by Claude AI — market pair impact, trade direction, entry zone, target and stop loss. Data-driven, not gut feeling.',
  },
  {
    icon: '🔔',
    title: 'Delivered to you',
    copy: 'Signals come to your Telegram automatically. You don\'t check a dashboard — we push the moment it matters.',
  },
  {
    icon: '🔑',
    title: 'API access included',
    copy: 'Build your own tools on top of our data. Pull signals into Zapier, n8n, or your own trading stack.',
  },
  {
    icon: '💷',
    title: 'Fraction of the cost',
    copy: 'Trading courses charge £1,000+. Private groups charge £3,000+. We charge £45/month for automated institutional-grade intel.',
  },
];

const comparisonRows = [
  { feature: 'SEC filing alerts', srh: true, tradingview: 'Stocks only', nolimit: false, courses: false },
  { feature: 'Economic calendar', srh: true, tradingview: true, nolimit: false, courses: false },
  { feature: 'AI trade predictions', srh: true, tradingview: false, nolimit: false, courses: false },
  { feature: 'Forex signals', srh: true, tradingview: false, nolimit: false, courses: false },
  { feature: 'Crypto signals', srh: true, tradingview: false, nolimit: 'Opinion only', courses: false },
  { feature: 'Telegram push alerts', srh: true, tradingview: false, nolimit: 'Delayed', courses: false },
  { feature: 'API access', srh: true, tradingview: false, nolimit: false, courses: false },
  { feature: 'AI lab coverage', srh: true, tradingview: false, nolimit: false, courses: false },
  { feature: 'No token required', srh: true, tradingview: true, nolimit: false, courses: true },
  { feature: 'Price', srh: '£45/mo', tradingview: '£15-60/mo', nolimit: '£3,000+', courses: '£1,000+' },
];

function ComparisonCell({ value }: { value: boolean | string }) {
  if (value === true) return <span className="text-emerald-400 font-bold">✓</span>;
  if (value === false) return <span className="text-white/20">✗</span>;
  return <span className="text-white/60 text-xs">{value}</span>;
}

function PricingSlider() {
  const [active, setActive] = useState(1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Simple, transparent pricing.</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActive((prev) => Math.max(0, prev - 1))}
            disabled={active === 0}
            className="h-8 w-8 rounded-full border border-white/20 text-white/60 hover:bg-white/10 disabled:opacity-30 transition-colors flex items-center justify-center"
          >
            ←
          </button>
          <span className="text-xs text-white/40">{active + 1} / {tiers.length}</span>
          <button
            onClick={() => setActive((prev) => Math.min(tiers.length - 1, prev + 1))}
            disabled={active === tiers.length - 1}
            className="h-8 w-8 rounded-full border border-white/20 text-white/60 hover:bg-white/10 disabled:opacity-30 transition-colors flex items-center justify-center"
          >
            →
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${active * 100}%)` }}
        >
          {tiers.map((tier) => (
            <div key={tier.name} className="w-full shrink-0 px-1">
              <div className={`rounded-3xl border p-6 ${tier.color} relative`}>
                {tier.badge && (
                  <span className={`absolute top-4 right-4 rounded-full px-3 py-1 text-xs font-semibold ${tier.badgeColor}`}>
                    {tier.badge}
                  </span>
                )}
                <div className={`text-xs uppercase tracking-wide font-semibold ${tier.labelColor}`}>{tier.name}</div>
                <div className="mt-3 flex items-end gap-1">
                  <span className="text-4xl font-bold text-white">{tier.price}</span>
                  <span className="text-white/50 mb-1">{tier.period}</span>
                </div>
                <div className="mt-6 space-y-2">
                  {tier.features.map((f) => (
                    <div key={f} className="flex items-start gap-2 text-sm text-white/80">
                      <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                      <span>{f}</span>
                    </div>
                  ))}
                  {tier.locked.map((f) => (
                    <div key={f} className="flex items-start gap-2 text-sm text-white/30">
                      <span className="mt-0.5 shrink-0">✗</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href={tier.ctaHref}
                  className={`mt-6 block w-full rounded-full py-2.5 text-center text-sm font-semibold transition-colors ${tier.ctaStyle}`}
                >
                  {tier.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-2">
        {tiers.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`h-1.5 rounded-full transition-all ${active === i ? 'w-6 bg-white' : 'w-1.5 bg-white/20'}`}
          />
        ))}
      </div>

      <p className="text-center text-xs text-white/40">Cancel anytime · No contracts · API key provisioned instantly</p>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral-950 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(67,56,202,0.25),_transparent_55%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10 sm:py-14">

        <header className="flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold hover:opacity-80 transition-opacity">Signal Relay Hub</Link>
          <nav className="flex items-center gap-3 text-sm text-neutral-300">
            <Link className="text-sm text-white/70 hover:text-white transition-colors" href="/login">
              Sign in
            </Link>
            <Link className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-200 transition-colors" href="/plans">
              Get started free
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
              <div className="mt-8 flex flex-wrap justify-center sm:justify-start gap-4">
                <Link href="/plans" className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 hover:bg-neutral-200 transition-colors">
                  Start for free →
                </Link>
                <Link href="/feed" className="rounded-full border border-white/40 px-5 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10 transition-colors">
                  View live feed
                </Link>
              </div>
              <div className="mt-6 flex gap-4">
                <a href="https://t.me/signalrelayhub" target="_blank" rel="noreferrer" className="text-xs text-white/40 hover:text-white/70 transition-colors">
                  📲 Join Telegram
                </a>
                <a href="https://discord.gg/4X9NGZuK" target="_blank" rel="noreferrer" className="text-xs text-white/40 hover:text-white/70 transition-colors">
                  💬 Join Discord
                </a>
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
                <span key={logo} className="font-medium tracking-tight">{logo}</span>
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

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
            <div className="text-xs uppercase tracking-[0.2em] text-white/50 mb-2">Why Signal Relay Hub</div>
            <h2 className="text-2xl font-semibold mb-8">Stop paying for opinions. Start getting data.</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {reasons.map((reason) => (
                <div key={reason.title} className="rounded-2xl border border-white/10 bg-black/30 p-5">
                  <div className="text-2xl mb-3">{reason.icon}</div>
                  <div className="text-sm font-semibold text-white mb-2">{reason.title}</div>
                  <p className="text-sm text-white/60 leading-relaxed">{reason.copy}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
            <div className="text-xs uppercase tracking-[0.2em] text-white/50 mb-2">How we compare</div>
            <h2 className="text-2xl font-semibold mb-2">Signal Relay Hub vs the alternatives</h2>
            <p className="text-sm text-white/50 mb-8">See why traders are switching from courses and influencers to automated data.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 pr-4 text-white/50 font-normal text-xs uppercase tracking-wide w-48">Feature</th>
                    <th className="py-3 px-4 text-center">
                      <div className="text-white font-semibold">Signal Relay Hub</div>
                      <div className="text-xs text-sky-300">£45/month</div>
                    </th>
                    <th className="py-3 px-4 text-center">
                      <div className="text-white/70 font-medium">TradingView</div>
                      <div className="text-xs text-white/40">£15-60/month</div>
                    </th>
                    <th className="py-3 px-4 text-center">
                      <div className="text-white/70 font-medium">Influencer Groups</div>
                      <div className="text-xs text-white/40">£3,000+</div>
                    </th>
                    <th className="py-3 px-4 text-center">
                      <div className="text-white/70 font-medium">Trading Courses</div>
                      <div className="text-xs text-white/40">£1,000+</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, i) => (
                    <tr key={row.feature} className={`border-b border-white/5 ${i % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                      <td className="py-3 pr-4 text-white/70 text-xs">{row.feature}</td>
                      <td className="py-3 px-4 text-center font-medium">{<ComparisonCell value={row.srh} />}</td>
                      <td className="py-3 px-4 text-center">{<ComparisonCell value={row.tradingview} />}</td>
                      <td className="py-3 px-4 text-center">{<ComparisonCell value={row.nolimit} />}</td>
                      <td className="py-3 px-4 text-center">{<ComparisonCell value={row.courses} />}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex justify-center">
              <Link href="/plans" className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-neutral-900 hover:bg-neutral-200 transition-colors">
                Get started free
              </Link>
            </div>
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
                Telegram, email, and webhook sequences ship with pre-built playbooks for ops, risk, and research teams.
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
            <PricingSlider />
          </section>

        </main>

        <footer className="mt-auto border-t border-white/5 pt-6 text-xs text-white/60">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span>© {new Date().getFullYear()} Signal Relay Hub · Built for fintech operators & traders.</span>
              <p className="mt-2 text-white/30 text-xs max-w-2xl">Risk disclaimer: All signals and analysis provided by Signal Relay Hub are for informational purposes only and do not constitute financial advice. Trading involves significant risk and you may lose more than your initial investment. Always do your own research. Signal Relay Hub accepts no liability for any losses incurred.</p>
            </div>
            <div className="flex gap-4">
              <Link href="/privacy" className="hover:text-white/80 transition-colors">Privacy Policy</Link>
              <a href="https://t.me/signalrelayhub" target="_blank" rel="noreferrer" className="hover:text-white/80 transition-colors">Telegram</a>
              <a href="https://discord.gg/4X9NGZuK" target="_blank" rel="noreferrer" className="hover:text-white/80 transition-colors">Discord</a>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
