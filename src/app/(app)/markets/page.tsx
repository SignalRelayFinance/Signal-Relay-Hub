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

function getImpactLabel(score: number): string {
  if (score >= 5) return 'Critical — immediate market reaction likely';
  if (score >= 4) return 'High — significant market relevance';
  if (score >= 3) return 'Moderate — watch for follow-through';
  if (score >= 2) return 'Low — minor market relevance';
  return 'Informational only';
}

function getImpactColor(score: number): string {
  if (score >= 5) return 'border-rose-500/30 bg-rose-500/10 text-rose-300';
  if (score >= 4) return 'border-amber-500/30 bg-amber-500/10 text-amber-300';
  if (score >= 3) return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300';
  return 'border-white/10 bg-white/5 text-white/40';
}

function getSentimentLabel(sentiment: string): string {
  if (sentiment === 'positive') return 'Bullish — markets likely to react positively';
  if (sentiment === 'negative') return 'Bearish — markets likely to react negatively';
  return 'Neutral — monitoring for follow-up signals';
}

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

  return <div id={`tv-${symbol}`} className="tradingview-widget-container h-[220px] w-full overflow-hidden" />;
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

  return <div id="tv-ticker" className="tradingview-widget-container w-full overflow-hidden" />;
}

export default function MarketsPage() {
  const [events, setEvents] = useState<SignalEvent[]>([]);
  const [category, setCategory] = useState('all');
  const [sentiment, setSentiment] = useState('all');
  const [loading, setLoading] = useState(false);
  const [activeChart, setActiveChart] = useState('XAUUSD');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [expandedSignal, setExpandedSignal] = useState<string | null>(null);

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
    <div className="space-y-8 max-w-[100vw] overflow-x-hidden">
      {!isSubscribed && !bannerDismissed && (
        <div className="rounded-2xl border border-sky-400/30 bg-sky-400/10 p-4 text-white flex flex-wrap items-center justify-between gap-3 mx-4 lg:mx-0">
          <div className="flex items-center gap-3">
            <span className="text-sky-400 text-lg">📡</span>
            <div>
              <div className="text-sm font-semibold">You are on the free plan</div>
              <div className="text-xs text-white/60">Upgrade to Pro to unlock Telegram alerts, Flash SEC filings, API access and full signal history.</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href="/pricing" className="rounded-full bg-sky-400 px-4 py-1.5 text-xs font-bold text-neutral-900 hover:bg-sky-300 transition-colors whitespace-nowrap">
              Upgrade to Pro
            </a>
            <button onClick={() => setBannerDismissed(true)} className="text-white/40 hover:text-white text-xs px-2">
              Dismiss
            </button>
          </div>
        </div>
      )}

      <section className="rounded-3xl bg-neutral-950 p-6 lg:p-8 text-white shadow-xl mx-4 lg:mx-0">
        <p className="text-xs uppercase tracking-[0.3em] text-white/60">Markets</p>
        <h1 className="mt-3 text-2xl lg:text-3xl font-semibold leading-tight">Live prices + signal impact.</h1>
        <p className="mt-3 text-sm text-white/70">Track how breaking signals move crypto, forex, metals and commodities in real time.</p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-white/60">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="font-semibold text-white mb-1">Impact score</div>
            <div>Rates 1-5 how likely a signal is to move markets. Impact 4-5 signals are high priority.</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="font-semibold text-white mb-1">Sentiment</div>
            <div>Bullish = positive for price. Bearish = negative. Neutral = informational, watch for follow-up.</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="font-semibold text-white mb-1">Market pairs</div>
            <div>Shows which forex, crypto or commodity pairs are affected and in which direction.</div>
          </div>
        </div>
        <div className="mt-6 w-full overflow-hidden rounded-2xl border border-white/10">
          <TradingViewTicker />
        </div>
      </section>

      <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 px-4 lg:px-0">
        {PAIRS.map((pair) => (
          <button key={pair.symbol} onClick={() => setActiveChart(pair.symbol)} className={`rounded-3xl border p-1 text-left transition-all overflow-hidden ${activeChart === pair.symbol ? 'border-sky-400/50 bg-sky-400/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
            <div className="px-3 pt-2 pb-1 text-xs font-semibold text-white/70">{pair.label} — {pair.symbol}</div>
            <TradingViewWidget symbol={pair.symbol} />
          </button>
        ))}
      </section>

      <section className="rounded-3xl border border-white/10 bg-neutral-950 p-6 lg:p-8 text-white mx-4 lg:mx-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold">Signal impact on markets</h2>
            <p className="text-xs text-white/50 mt-1">AI-analysed signals mapped to affected trading pairs</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex overflow-x-auto gap-1 pb-2 sm:pb-0 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button key={cat} onClick={() => setCategory(cat)} className={`whitespace-nowrap shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors capitalize ${category === cat ? 'bg-white text-neutral-900' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex overflow-x-auto gap-1 pb-2 sm:pb-0 scrollbar-none">
              {['all', 'positive', 'neutral', 'negative'].map((s) => (
                <button key={s} onClick={() => setSentiment(s)} className={`whitespace-nowrap shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${sentiment === s ? (s === 'positive' ? 'bg-emerald-500 text-white' : s === 'negative' ? 'bg-rose-500 text-white' : 'bg-white text-neutral-900') : 'bg-white/10 text-white hover:bg-white/20'}`}>
                  {s === 'positive' ? '▲ Bullish' : s === 'negative' ? '▼ Bearish' : s === 'neutral' ? '— Neutral' : 'All'}
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredEvents.map((event) => {
              const isExpanded = expandedSignal === event.id;
              return (
                <div key={event.id} className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden transition-all duration-300">
                  <button 
                    onClick={() => setExpandedSignal(isExpanded ? null : event.id)}
                    className="w-full text-left p-4 focus:outline-none"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium text-white/80">{event.company}</span>
                        {event.primary_tag && <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-xs text-purple-200">{event.primary_tag}</span>}
                        {event.published_at && (
                          <span className="text-xs font-mono text-white/30">
                            {new Date(event.published_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <span className="text-white/40 text-xs shrink-0">{isExpanded ? '▼' : '►'}</span>
                    </div>
                    
                    <div className="text-sm font-semibold text-white hover:text-sky-200 line-clamp-2 pr-4">{event.title}</div>
                    
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {event.impact_score && (
                        <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${getImpactColor(event.impact_score)}`}>
                          Impact {event.impact_score}/5
                        </span>
                      )}
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        event.sentiment === 'positive' ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-300' :
                        event.sentiment === 'negative' ? 'border border-rose-500/30 bg-rose-500/10 text-rose-300' :
                        'border border-white/10 bg-white/5 text-white/40'
                      }`}>
                        {event.sentiment === 'positive' ? '▲ Bullish' : event.sentiment === 'negative' ? '▼ Bearish' : '— Neutral'}
                      </span>
                    </div>
                  </button>

                  <div className={`px-4 pb-4 overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 pb-0'}`}>
                    <div className="pt-2 border-t border-white/10">
                      {event.summary && <p className="text-xs text-white/60 mb-3">{event.summary}</p>}
                      <a href={event.source_url} target="_blank" rel="noreferrer" className="text-xs text-sky-400 hover:text-sky-300 mb-3 inline-block">Read full source →</a>
                      
                      {event.pairs_analysis ? (
                        <div className="mt-1">
                          <div className="text-xs text-white/30 uppercase tracking-wide mb-2">Affected pairs</div>
                          <div className="flex flex-col gap-2">
                            {event.pairs_analysis.pairs?.map((p) => (
                              <div key={p.pair} className={`flex flex-col gap-1 rounded-xl border px-3 py-2 ${p.direction === 'bullish' ? 'border-emerald-500/20 bg-emerald-500/5' : p.direction === 'bearish' ? 'border-rose-500/20 bg-rose-500/5' : 'border-white/10 bg-white/5'}`}>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-mono font-bold text-white">{p.pair}</span>
                                  <span className={`text-xs font-bold ${p.direction === 'bullish' ? 'text-emerald-400' : p.direction === 'bearish' ? 'text-rose-400' : 'text-white/50'}`}>
                                    {p.direction === 'bullish' ? '▲' : p.direction === 'bearish' ? '▼' : '—'}{'●'.repeat(p.strength)}
                                  </span>
                                </div>
                                <span className="text-xs text-white/50">{p.reason}</span>
                              </div>
                            ))}
                          </div>
                          {event.pairs_analysis.overall && <p className="mt-3 text-xs text-white/50 italic border-l-2 border-white/20 pl-2">{event.pairs_analysis.overall}</p>}
                        </div>
                      ) : (
                        <div className="mt-2 text-xs text-white/20 italic">Pair analysis queued for next pipeline run</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {isGated && (
              <div className="col-span-1 lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-6 text-center mt-2">
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
