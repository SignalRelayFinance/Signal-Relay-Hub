/* eslint-disable react/no-unescaped-entities */
'use client';

import { useEffect, useState, useCallback } from 'react';
import type { SignalEvent } from '@/lib/types';

const PAIRS = [
  { symbol: 'XAUUSD', label: 'Gold', category: 'metals' },
  { symbol: 'BTCUSD', label: 'Bitcoin', category: 'crypto' },
  { symbol: 'ETHUSD', label: 'Ethereum', category: 'crypto' },
  { symbol: 'EURUSD', label: 'EUR/USD', category: 'forex' },
  { symbol: 'GBPUSD', label: 'GBP/USD', category: 'forex' },
  { symbol: 'US30', label: 'Dow Jones', category: 'equities' },
];

const CATEGORIES = ['all', 'crypto', 'forex', 'metals', 'commodities'];

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  crypto: ['bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'coinbase', 'blockchain', 'btcusd', 'ethusd'],
  forex: ['eurusd', 'gbpusd', 'fed', 'ecb', 'central bank', 'interest rate', 'currency', 'revolut', 'stripe', 'payment', 'fx'],
  metals: ['gold', 'silver', 'xauusd', 'commodit', 'precious', 'metal'],
  commodities: ['oil', 'usoil', 'energy', 'crude', 'commodity'],
};

const CATEGORY_PAIRS: Record<string, string[]> = {
  crypto: ['BTCUSD', 'ETHUSD'],
  forex: ['EURUSD', 'GBPUSD'],
  metals: ['XAUUSD'],
  commodities: ['USOIL'],
};

function getSymbol(symbol: string): string {
  if (symbol === 'XAUUSD') return 'OANDA:XAUUSD';
  if (symbol === 'BTCUSD') return 'BITSTAMP:BTCUSD';
  if (symbol === 'ETHUSD') return 'BITSTAMP:ETHUSD';
  if (symbol === 'US30') return 'FOREXCOM:US30';
  return `FX:${symbol}`;
}

function TradingViewWidget({ symbol }: { symbol: string }) {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol: getSymbol(symbol),
      width: '100%',
      height: 220,
      locale: 'en',
      dateRange: '1D',
      colorTheme: 'dark',
      isTransparent: true,
      autosize: true,
      largeChartUrl: '',
    });
    const container = document.getElementById(`tv-${symbol}`);
    if (container) {
      container.innerHTML = '';
      container.appendChild(script);
    }
  }, [symbol]);

  return <div id={`tv-${symbol}`} className="tradingview-widget-container h-[220px] w-full" />;
}

function TradingViewTicker() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: 'FOREXCOM:XAUUSD', title: 'Gold' },
        { proName: 'BITSTAMP:BTCUSD', title: 'Bitcoin' },
        { proName: 'BITSTAMP:ETHUSD', title: 'Ethereum' },
        { proName: 'FX:EURUSD', title: 'EUR/USD' },
        { proName: 'FX:GBPUSD', title: 'GBP/USD' },
        { proName: 'NYMEX:CL1!', title: 'Crude Oil' },
        { proName: 'FOREXCOM:US30', title: 'US30' },
      ],
      showSymbolLogo: true,
      colorTheme: 'dark',
      isTransparent: true,
      displayMode: 'adaptive',
      locale: 'en',
    });
    const container = document.getElementById('tv-ticker');
    if (container) {
      container.innerHTML = '';
      container.appendChild(script);
    }
  }, []);

  return <div id="tv-ticker" className="tradingview-widget-container w-full" />;
}

export default function MarketsPage() {
  const [events, setEvents] = useState<SignalEvent[]>([]);
  const [category, setCategory] = useState('all');
  const [sentiment, setSentiment] = useState('all');
  const [loading, setLoading] = useState(false);
  const [activeChart, setActiveChart] = useState('XAUUSD');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/events?limit=50');
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json() as { events: SignalEvent[] };
      setEvents(data.events ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    fetch('/api/profile').then(r => r.json()).then(p => {
      setIsSubscribed(p.is_subscribed ?? false);
    }).catch(() => {});
  }, []);

  const FREE_SIGNAL_LIMIT = 5;
  const allFilteredEvents = events.filter((e) => {
    const matchesSentiment = sentiment === 'all' || e.sentiment === sentiment;
    const matchesCategory = category === 'all' || (() => {
      const keywords = CATEGORY_KEYWORDS[category] ?? [];
      const pairNames = CATEGORY_PAIRS[category] ?? [];
      const text = `${e.title} ${e.summary} ${e.company} ${e.tags?.join(' ')}`.toLowerCase();
      if (e.pairs_analysis?.pairs?.some((p) => pairNames.includes(p.pair))) return true;
      return keywords.some((k) => text.includes(k));
    })();
    return matchesSentiment && matchesCategory;
  });
  const filteredEvents = isSubscribed ? allFilteredEvents : allFilteredEvents.slice(0, FREE_SIGNAL_LIMIT);
  const isGated = !isSubscribed && allFilteredEvents.length > FREE_SIGNAL_LIMIT;

  return (
    <div className="space-y-8">
      {!isSubscribed && !bannerDismissed && (
        <div className="rounded-2xl border border-sky-400/30 bg-sky-400/10 p-4 text-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-sky-400 text-lg">📡</span>
            <div>
              <div className="text-sm font-semibold">You are on the free plan</div>
              <div className="text-xs text-white/60">Upgrade to Pro to unlock Telegram alerts, Flash SEC filings, API access and full signal history.</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href="/pricing" className="rounded-full bg-sky-400 px-4 py-1.5 text-xs font-bold text-neutral-900 hover:bg-sky-300 transition-colors">
              Upgrade to Pro
            </a>
            <button onClick={() => setBannerDismissed(true)} className="text-white/40 hover:text-white text-xs px-2">
              Dismiss
            </button>
          </div>
        </div>
      )}

      <section className="rounded-3xl bg-neutral-950 p-8 text-white shadow-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-white/60">Markets</p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight">Live prices + signal impact.</h1>
        <p className="mt-3 text-sm text-white/70">Track how breaking signals move crypto, forex, metals and commodities in real time.</p>
        <div className="mt-6 w-full overflow-hidden rounded-2xl border border-white/10">
          <TradingViewTicker />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PAIRS.map((pair) => (
          <button key={pair.symbol} onClick={() => setActiveChart(pair.symbol)} className={`rounded-3xl border p-1 text-left transition-all ${activeChart === pair.symbol ? 'border-sky-400/50 bg-sky-400/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
            <div className="px-3 pt-2 pb-1 text-xs font-semibold text-white/70">{pair.label} — {pair.symbol}</div>
            <TradingViewWidget symbol={pair.symbol} />
          </button>
        ))}
      </section>

      <section className="rounded-3xl border border-white/10 bg-neutral-950 p-6 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-semibold">Signal impact on markets</h2>
          <div className="flex flex-wrap gap-3">
            <div className="flex flex-wrap gap-1">
              {CATEGORIES.map((cat) => (
                <button key={cat} onClick={() => setCategory(cat)} className={`rounded-full px-3 py-1 text-xs font-medium transition-colors capitalize ${category === cat ? 'bg-white text-neutral-900' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
              {['all', 'positive', 'neutral', 'negative'].map((s) => (
                <button key={s} onClick={() => setSentiment(s)} className={`rounded-full px-3 py-1 text-xs font-medium transition-colors capitalize ${sentiment === s ? (s === 'positive' ? 'bg-emerald-500 text-white' : s === 'negative' ? 'bg-rose-500 text-white' : 'bg-white text-neutral-900') : 'bg-white/10 text-white hover:bg-white/20'}`}>
                  {s === 'positive' ? 'Bullish' : s === 'negative' ? 'Bearish' : s === 'neutral' ? 'Neutral' : 'All'}
                </button>
              ))}
            </div>
          </div>
        </div>
        {loading ? (
          <div className="text-sm text-white/50 text-center py-8">Loading signals...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-sm text-white/50 text-center py-8">No signals match this filter.</div>
        ) : (
          <div className="space-y-3">
            {filteredEvents.map((event) => (
              <div key={event.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-white/50 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white/80">{event.company}</span>
                    {event.primary_tag && <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-purple-200">{event.primary_tag}</span>}
                    {event.impact_score && <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-amber-200">Impact {event.impact_score}</span>}
                  </div>
                  <span className={`font-semibold ${event.sentiment === 'positive' ? 'text-emerald-400' : event.sentiment === 'negative' ? 'text-rose-400' : 'text-white/50'}`}>
                    {event.sentiment === 'positive' ? '▲' : event.sentiment === 'negative' ? '▼' : '—'} {event.sentiment}
                  </span>
                </div>
                <a href={event.source_url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-white hover:text-sky-200">{event.title}</a>
                {event.pairs_analysis ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {event.pairs_analysis.pairs?.map((p) => (
                      <div key={p.pair} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                        <span className="text-xs font-mono font-medium text-white">{p.pair}</span>
                        <span className={`text-xs font-bold ${p.direction === 'bullish' ? 'text-emerald-400' : p.direction === 'bearish' ? 'text-rose-400' : 'text-white/50'}`}>
                          {p.direction === 'bullish' ? '▲' : p.direction === 'bearish' ? '▼' : '—'}{'●'.repeat(p.strength)}
                        </span>
                        <span className="text-xs text-white/40">{p.reason}</span>
                      </div>
                    ))}
                    {event.pairs_analysis.overall && <p className="w-full mt-1 text-xs text-white/50">{event.pairs_analysis.overall}</p>}
                  </div>
                ) : (
                  <div className="mt-2 text-xs text-white/30">Market pair analysis pending next pipeline run</div>
                )}
              </div>
            ))}
            {isGated && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
                <div className="text-xs uppercase tracking-wide text-white/40 mb-2">Free plan limit reached</div>
                <div className="text-base font-semibold text-white mb-1">{allFilteredEvents.length - FREE_SIGNAL_LIMIT} more market signals available</div>
                <p className="text-sm text-white/50 mb-4">Pro members see full signal history with market pair analysis and Telegram alerts.</p>
                <a href="/pricing" className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-neutral-900 hover:bg-white/90 transition-colors">
                  Upgrade to Pro
                </a>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
