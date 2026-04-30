import React from 'react';
import Link from 'next/link';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Live SEC Filing Tracker & AI Summaries | Signal Relay Hub',
  description: 'Track real-time SEC filings (8-K, Form 4, 13D/G) with instant AI-generated market impact summaries. Institutional intel, no login required.',
  openGraph: {
    title: 'Live SEC Filing Tracker | Signal Relay Hub',
    description: 'Track real-time SEC filings with AI summaries.',
    url: 'https://www.signalrelayhub.io/sec-filings',
    siteName: 'Signal Relay Hub',
  },
};

function getFormType(title: string) {
  if (title.includes('8-K')) return '8-K (Material Event)';
  if (title.includes('Form 4')) return 'Form 4 (Insider)';
  if (title.includes('13D') || title.includes('13G')) return '13D/G (Ownership)';
  if (title.includes('S-1')) return 'S-1 (Offering)';
  if (title.includes('10-Q')) return '10-Q (Quarterly)';
  if (title.includes('10-K')) return '10-K (Annual)';
  return 'SEC Filing';
}

function getImpactColor(score: number) {
  if (score >= 4) return 'bg-rose-500/10 border-rose-500/30 text-rose-400';
  if (score === 3) return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
  return 'bg-white/5 border-white/10 text-white/50';
}

export default async function PublicSECTrackerPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    }
  );

  // Fetch only regulatory events
  const { data: filings } = await supabase
    .from('sf_events')
    .select('id, company, title, summary, fetched_at, source_url, impact_score')
    .eq('primary_tag', 'regulatory')
    .order('fetched_at', { ascending: false })
    .limit(40);

  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral-950 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(225,29,72,0.15),_transparent_50%)]" />
      
      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-10">
        <header className="flex items-center justify-between mb-16">
          <Link href="/" className="text-lg font-semibold hover:opacity-80 transition-opacity">Signal Relay Hub</Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link className="text-white/70 hover:text-white transition-colors" href="/login">Sign in</Link>
            <Link className="rounded-full bg-white px-4 py-2 font-semibold text-neutral-900 hover:bg-neutral-200 transition-colors" href="/pricing">Get started free</Link>
          </nav>
        </header>

        <main className="flex-1 space-y-12">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">Live SEC Filing Tracker</h1>
            <p className="mt-4 text-lg text-white/60">
              Real-time monitoring of the SEC EDGAR database. We extract high-impact filings and use AI to summarize the market catalyst instantly.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {!filings || filings.length === 0 ? (
              <div className="col-span-2 rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-white/50">
                No recent SEC filings found.
              </div>
            ) : (
              filings.map((filing) => {
                const formType = getFormType(filing.title);
                return (
                  <div key={filing.id} className="rounded-2xl border border-white/10 bg-black/40 p-5 flex flex-col hover:bg-black/60 transition-colors">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-white">{filing.company}</span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/60">{formType}</span>
                      </div>
                      <span className="text-xs font-mono text-white/30">
                        {new Date(filing.fetched_at).toLocaleString('en-GB', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <a href={filing.source_url} target="_blank" rel="noreferrer" className="text-base font-medium text-white hover:text-sky-300 leading-snug">
                      {filing.title}
                    </a>
                    
                    {filing.summary && (
                      <p className="mt-2 text-sm text-white/60 line-clamp-3 flex-1">
                        <span className="font-semibold text-white/80">AI Summary:</span> {filing.summary}
                      </p>
                    )}

                    <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                      <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${getImpactColor(filing.impact_score)}`}>
                        Impact {filing.impact_score}/5
                      </span>
                      <a href={filing.source_url} target="_blank" rel="noreferrer" className="text-xs font-medium text-white/40 hover:text-white transition-colors">
                        View filing ↗
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="rounded-3xl border border-rose-500/20 bg-gradient-to-b from-rose-500/10 to-neutral-900 p-8 text-center sm:p-12 mt-12">
            <h2 className="text-2xl font-semibold text-white">Want these alerts pushed to your phone?</h2>
            <p className="mt-2 text-white/60 max-w-xl mx-auto">
              Pro members get these SEC filings pushed directly to their Telegram within 2 minutes of hitting the EDGAR database, bypassing dashboard refresh delays.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Link href="/pricing" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-200 transition-colors">
                View Pro Plans
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
