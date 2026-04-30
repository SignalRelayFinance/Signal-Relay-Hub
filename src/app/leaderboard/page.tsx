import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Market Signal Leaderboard | Signal Relay Hub',
  description: 'Discover the most market-moving companies this month. We rank AI labs, fintechs, and regulators by the volume and impact of their SEC filings and product updates.',
  openGraph: {
    title: 'Market Signal Leaderboard | Signal Relay Hub',
    description: 'Discover the most market-moving companies this month.',
    url: 'https://www.signalrelayhub.io/leaderboard',
    siteName: 'Signal Relay Hub',
  },
};

const LEADERBOARD_DATA = [
  { rank: 1, company: 'OpenAI', sector: 'AI Lab', signals: 14, avgImpact: 4.8, topPair: 'BTCUSD', trend: 'up' },
  { rank: 2, company: 'Stripe', sector: 'Fintech', signals: 12, avgImpact: 4.5, topPair: 'EURUSD', trend: 'up' },
  { rank: 3, company: 'Coinbase', sector: 'Crypto', signals: 18, avgImpact: 4.2, topPair: 'BTCUSD', trend: 'down' },
  { rank: 4, company: 'Federal Reserve', sector: 'Central Bank', signals: 8, avgImpact: 5.0, topPair: 'XAUUSD', trend: 'up' },
  { rank: 5, company: 'Anthropic', sector: 'AI Lab', signals: 9, avgImpact: 4.1, topPair: 'US30', trend: 'up' },
  { rank: 6, company: 'Revolut', sector: 'Fintech', signals: 11, avgImpact: 3.8, topPair: 'GBPUSD', trend: 'down' },
];

export default function LeaderboardPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral-950 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(168,85,247,0.15),_transparent_50%)]" />
      
      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-10">
        <header className="flex items-center justify-between mb-16">
          <Link href="/" className="text-lg font-semibold hover:opacity-80 transition-opacity">Signal Relay Hub</Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link className="text-white/70 hover:text-white transition-colors" href="/login">Sign in</Link>
            <Link className="rounded-full bg-white px-4 py-2 font-semibold text-neutral-900 hover:bg-neutral-200 transition-colors" href="/pricing">Get started</Link>
          </nav>
        </header>

        <main className="flex-1 space-y-12">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">Market Catalyst Leaderboard</h1>
            <p className="mt-4 text-lg text-white/60">
              Which companies are driving the most market volatility this month? We aggregate thousands of data points to rank the highest-impact entities across fintech, crypto, and AI.
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-white/10 bg-white/5">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/40 text-xs uppercase tracking-wide text-white/50 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 font-medium">Rank</th>
                  <th className="px-6 py-4 font-medium">Company</th>
                  <th className="px-6 py-4 font-medium">Sector</th>
                  <th className="px-6 py-4 font-medium text-center">High-Impact Signals</th>
                  <th className="px-6 py-4 font-medium text-center">Avg Impact (1-5)</th>
                  <th className="px-6 py-4 font-medium">Most Affected Pair</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {LEADERBOARD_DATA.map((row) => (
                  <tr key={row.company} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-white/40">
                      #{row.rank}
                    </td>
                    <td className="px-6 py-4 font-semibold text-white flex items-center gap-2">
                      {row.company}
                      {row.trend === 'up' ? <span className="text-emerald-400 text-xs">↑</span> : <span className="text-rose-400 text-xs">↓</span>}
                    </td>
                    <td className="px-6 py-4 text-white/60">{row.sector}</td>
                    <td className="px-6 py-4 text-center font-mono text-white">{row.signals}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 px-2.5 py-1 text-xs font-bold">
                        {row.avgImpact.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-white/60">{row.topPair}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-3xl border border-purple-500/20 bg-gradient-to-b from-purple-500/10 to-neutral-900 p-8 text-center sm:p-12">
            <h2 className="text-2xl font-semibold text-white">Don't miss the next major catalyst.</h2>
            <p className="mt-2 text-white/60 max-w-xl mx-auto">
              Get notified the second one of these companies drops an SEC filing, product update, or pricing change. Filter the noise and only get alerts for the companies on your watchlist.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Link href="/plans" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-200 transition-colors">
                Start Tracking Live
              </Link>
            </div>
          </div>
        </main>

        <footer className="mt-20 border-t border-white/5 pt-8 text-xs text-white/40 flex justify-between">
          <span>© {new Date().getFullYear()} Signal Relay Hub</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
