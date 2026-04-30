import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'AI Economic Calendar & Market Impact | Signal Relay Hub',
  description: 'Track high-impact macroeconomic events like NFP, CPI, and FOMC with AI-predicted market pair impact. Institutional calendar data for retail traders.',
  openGraph: {
    title: 'AI Economic Calendar | Signal Relay Hub',
    description: 'Track high-impact macroeconomic events with AI-predicted impact.',
    url: 'https://www.signalrelayhub.io/economic-calendar',
    siteName: 'Signal Relay Hub',
  },
};

const MOCK_EVENTS = [
  { id: 1, time: '13:30', currency: 'USD', event: 'Core CPI m/m', impact: 'High', forecast: '0.3%', previous: '0.4%', aiBias: 'Bearish for USD, Bullish for XAUUSD' },
  { id: 2, time: '13:30', currency: 'USD', event: 'Unemployment Claims', impact: 'High', forecast: '215K', previous: '211K', aiBias: 'Neutral — Watch for deviation > 15K' },
  { id: 3, time: '15:00', currency: 'USD', event: 'ISM Services PMI', impact: 'High', forecast: '51.4', previous: '52.6', aiBias: 'Bullish for USD if > 52.0' },
  { id: 4, time: '18:00', currency: 'EUR', event: 'ECB President Lagarde Speaks', impact: 'High', forecast: '—', previous: '—', aiBias: 'High volatility expected on EURUSD' },
];

export default function EconomicCalendarPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral-950 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.15),_transparent_50%)]" />
      
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
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">AI-Powered Economic Calendar</h1>
            <p className="mt-4 text-lg text-white/60">
              Stop guessing how the market will react. We track global economic data releases and use AI to instantly map the directional impact on Forex and Crypto pairs.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
            <div className="border-b border-white/10 bg-black/40 px-6 py-4 flex items-center justify-between">
              <h2 className="font-semibold text-white">Today's High-Impact Events</h2>
              <span className="text-xs font-mono text-white/50">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            </div>
            
            <div className="divide-y divide-white/10">
              {MOCK_EVENTS.map((item) => (
                <div key={item.id} className="p-6 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-4 sm:w-1/4">
                    <span className="text-sm font-mono text-white/60">{item.time}</span>
                    <span className="rounded bg-white/10 px-2 py-1 text-xs font-bold text-white">{item.currency}</span>
                    <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" title="High Impact" />
                  </div>
                  
                  <div className="sm:w-2/4">
                    <div className="font-medium text-white">{item.event}</div>
                    <div className="mt-1 flex gap-4 text-xs text-white/50">
                      <span>Forecast: <span className="text-white/80">{item.forecast}</span></span>
                      <span>Previous: <span className="text-white/80">{item.previous}</span></span>
                    </div>
                  </div>

                  <div className="sm:w-1/4 rounded-xl border border-sky-500/20 bg-sky-500/5 p-3">
                    <div className="text-[10px] uppercase tracking-wide text-sky-400/70 mb-1">AI Impact Prediction</div>
                    <div className="text-xs text-sky-100 font-medium">{item.aiBias}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-sky-500/20 bg-gradient-to-b from-sky-500/10 to-neutral-900 p-8 text-center sm:p-12">
            <h2 className="text-2xl font-semibold text-white">Trade the news before the crowd.</h2>
            <p className="mt-2 text-white/60 max-w-xl mx-auto">
              Elite members get pre-event alerts 15 minutes before high-impact releases, complete with AI trade setups, entry zones, and risk parameters directly to Telegram.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Link href="/plans" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-200 transition-colors">
                Unlock Elite Features
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
