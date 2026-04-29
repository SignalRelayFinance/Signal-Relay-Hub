/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import type { SignalEvent, StatusPayload } from '@/lib/types';

const TAGS = ['all', 'product', 'regulatory', 'funding', 'pricing', 'security', 'partnership', 'talent', 'insider_trading', 'ownership_change', 'merger_acquisition', 'management', 'earnings', 'general'];
const PAGE_SIZE = 200;

const SIGNAL_FILTERS = [
  { key: 'all', label: 'All signals' },
  { key: 'trade_prediction', label: 'Trade predictions', elite: true },
  { key: 'pairs_analysis', label: 'Market analysis' },
  { key: 'high_impact', label: 'High impact (4-5)' },
  { key: 'bullish', label: 'Bullish' },
  { key: 'bearish', label: 'Bearish' },
  { key: 'sec', label: 'SEC filings' },
];

const impactColors: Record<string, string> = {
  High: 'bg-rose-500',
  Medium: 'bg-amber-500',
  Low: 'bg-yellow-500',
};

const SIGNAL_RESULTS = [
  { pair: 'XAUUSD', direction: 'LONG', result: '+180 pips', time: '4h ago', signal: 'Fed hawkish tone triggered gold rally', profit: '+£360 est.' },
  { pair: 'EURUSD', direction: 'SHORT', result: '+95 pips', time: '6h ago', signal: 'ECB filing triggered EUR bearish setup', profit: '+£190 est.' },
  { pair: 'BTCUSD', direction: 'LONG', result: '+2.4%', time: '8h ago', signal: 'Coinbase SEC 8-K filing — bullish catalyst', profit: '+£240 est.' },
  { pair: 'GBPUSD', direction: 'SHORT', result: '+65 pips', time: '12h ago', signal: 'BOE Governor speech triggered GBP weakness', profit: '+£130 est.' },
  { pair: 'USOIL', direction: 'LONG', result: '+1.8%', time: '1d ago', signal: 'Hormuz constraints — oil supply shock signal', profit: '+£180 est.' },
];

function RotatingBanner() {
  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % SIGNAL_RESULTS.length);
        setFade(true);
      }, 300);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const result = SIGNAL_RESULTS[current];
  if (!result) return null;

  return (
    <div className={`p-3 transition-opacity duration-300 ${fade ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-sm font-bold text-white shrink-0">{result.pair}</span>
          <span className={`rounded px-1.5 py-0.5 text-xs font-bold shrink-0 ${result.direction === 'LONG' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
            {result.direction === 'LONG' ? '▲' : '▼'} {result.direction}
          </span>
          <span className="text-xs text-white/40 truncate">{result.signal}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm font-bold text-emerald-400">{result.result}</span>
          <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-300">{result.profit}</span>
        </div>
      </div>
      <div className="mt-2 flex gap-1">
        {SIGNAL_RESULTS.map((_, i) => (
          <span key={i} className={`h-0.5 flex-1 rounded-full transition-all ${i === current ? 'bg-emerald-400' : 'bg-white/10'}`} />
        ))}
      </div>
    </div>
  );
}

function CalendarCard({ event }: { event: SignalEvent }) {
  const impact = (event as any).impact as string | undefined;
  const currency = (event as any).currency as string | undefined;
  const forecast = (event as any).forecast as string | undefined;
  const actual = (event as any).actual_value as string | undefined;
  const previous = (event as any).previous_value as string | undefined;

  let beat = false;
  let missed = false;
  if (actual && forecast) {
    try {
      const a = parseFloat(actual.replace(/[%KMB,]/g, ''));
      const f = parseFloat(forecast.replace(/[%KMB,]/g, ''));
      if (!isNaN(a) && !isNaN(f)) { beat = a > f; missed = a < f; }
    } catch { /* ignore */ }
  }

  return (
    <div className={`rounded-xl border p-3 text-white ${actual ? (beat ? 'border-emerald-500/30 bg-emerald-500/10' : missed ? 'border-rose-500/30 bg-rose-500/10' : 'border-white/10 bg-white/5') : 'border-white/10 bg-white/5'}`}>
      <div className="flex items-center gap-2 mb-2">
        {impact && <span className={`h-2 w-2 rounded-full shrink-0 ${impactColors[impact] ?? 'bg-gray-500'}`} />}
        <span className="text-xs font-mono text-white/50">
          {event.published_at ? new Date(event.published_at).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
        </span>
        {currency && <span className="rounded bg-white/10 px-1.5 py-0.5 text-xs font-bold text-white">{currency}</span>}
      </div>
      <div className="text-sm font-medium text-white leading-snug mb-2">
        {event.title?.replace(/^[A-Z]{3}\s/, '')}
      </div>
      {(actual || forecast || previous) && (
        <div className="grid grid-cols-3 gap-1 text-xs border-t border-white/10 pt-2">
          <div>
            <div className="text-white/40 mb-0.5">Actual</div>
            <div className={`font-bold ${beat ? 'text-emerald-400' : missed ? 'text-rose-400' : 'text-white/70'}`}>{actual || '—'}</div>
          </div>
          <div>
            <div className="text-white/40 mb-0.5">Forecast</div>
            <div className="text-white/70">{forecast || '—'}</div>
          </div>
          <div>
            <div className="text-white/40 mb-0.5">Previous</div>
            <div className="text-white/50">{previous || '—'}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function EventCard({ event, isElite }: { event: SignalEvent; isElite?: boolean }) {
  const sentiment = event.sentiment;
  const isPositive = sentiment === 'positive';
  const isNegative = sentiment === 'negative';

  const cardBorder = isPositive
    ? 'border-emerald-500/30 shadow-emerald-500/10 shadow-lg'
    : isNegative
    ? 'border-rose-500/30 shadow-rose-500/10 shadow-lg'
    : 'border-white/10';

  const sentimentBadge = isPositive
    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
    : isNegative
    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
    : 'bg-white/5 text-white/50 border border-white/10';

  const sentimentLabel = isPositive ? '▲ Bullish' : isNegative ? '▼ Bearish' : '— Neutral';

  const impactLabel = event.impact_score >= 5 ? 'Critical'
    : event.impact_score >= 4 ? 'High'
    : event.impact_score >= 3 ? 'Moderate'
    : event.impact_score >= 2 ? 'Low'
    : 'Info';

  const impactBadge = event.impact_score >= 4
    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
    : event.impact_score >= 3
    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
    : 'bg-white/5 text-white/40 border border-white/10';

  return (
    <div className={`rounded-2xl border bg-white/5 p-4 text-white transition-all ${cardBorder}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-white/40">
            {event.published_at && !event.published_at.includes('1970')
              ? new Date(event.published_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
              : new Date(event.fetched_at ?? '').toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="rounded-full bg-white/10 px-2 py-0.5 font-medium text-white">{event.company}</span>
          {event.primary_tag && (
            <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-purple-200">{event.primary_tag}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {event.impact_score && (
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${impactBadge}`}>
              {impactLabel} impact
            </span>
          )}
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${sentimentBadge}`}>
            {sentimentLabel}
          </span>
        </div>
      </div>
      <div>
        <a href={event.source_url} target="_blank" rel="noopener noreferrer" className="text-base font-semibold text-white hover:text-sky-200 leading-snug">
          {event.title}
        </a>
        {event.summary && <p className="mt-1.5 text-sm text-white/60 line-clamp-2">{event.summary}</p>}
      </div>
      {event.pairs_analysis && (
        <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-2.5">
          <div className="text-xs uppercase tracking-wide text-white/40 mb-1.5">Market impact</div>
          <div className="flex flex-wrap gap-1.5">
            {event.pairs_analysis.pairs?.map((p) => (
              <div key={p.pair} className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 ${p.direction === 'bullish' ? 'border-emerald-500/20 bg-emerald-500/10' : p.direction === 'bearish' ? 'border-rose-500/20 bg-rose-500/10' : 'border-white/10 bg-white/5'}`}>
                <span className="text-xs font-mono font-medium text-white">{p.pair}</span>
                <span className={`text-xs font-bold ${p.direction === 'bullish' ? 'text-emerald-400' : p.direction === 'bearish' ? 'text-rose-400' : 'text-white/50'}`}>
                  {p.direction === 'bullish' ? '▲' : p.direction === 'bearish' ? '▼' : '—'}{'●'.repeat(p.strength)}
                </span>
              </div>
            ))}
          </div>
          {event.pairs_analysis.overall && <p className="mt-1.5 text-xs text-white/50">{event.pairs_analysis.overall}</p>}
        </div>
      )}
      {event.trade_prediction && (
        <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs uppercase tracking-wide text-amber-400/70">Elite — Trade predictions</div>
            {event.trade_prediction.confidence_score && (
              <div className="flex items-center gap-1.5">
                <div className={`h-1.5 w-1.5 rounded-full ${event.trade_prediction.confidence_score >= 75 ? 'bg-emerald-400' : event.trade_prediction.confidence_score >= 55 ? 'bg-amber-400' : 'bg-rose-400'}`} />
                <span className={`text-xs font-bold ${event.trade_prediction.confidence_score >= 75 ? 'text-emerald-400' : event.trade_prediction.confidence_score >= 55 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {event.trade_prediction.confidence_score}% confidence
                </span>
                {(event.trade_prediction.corroborating_signals ?? 0) > 0 && (
                  <span className="text-xs text-white/30">{event.trade_prediction.corroborating_signals} corroborating signals</span>
                )}
              </div>
            )}
          </div>
          <div className={isElite ? '' : 'blur-sm pointer-events-none select-none'}>
            {event.trade_prediction.trades?.map((t) => (
              <div key={t.pair} className="mb-3 last:mb-0 pb-3 last:pb-0 border-b last:border-0 border-white/10">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-xs font-bold text-white">{t.pair}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${t.direction === 'long' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {t.direction === 'long' ? 'LONG' : 'SHORT'}
                  </span>
                  <span className="rounded-full px-2 py-0.5 text-xs bg-amber-500/20 text-amber-400">{t.conviction} conviction</span>
                  <span className="text-xs text-white/40">{t.timeframe}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs mb-1.5">
                  <div><span className="text-white/40">Entry </span><span className="text-white/80 font-mono">{t.entry_zone}</span></div>
                  <div><span className="text-white/40">Target </span><span className="text-emerald-400 font-mono">{t.target}</span></div>
                  <div><span className="text-white/40">Stop </span><span className="text-rose-400 font-mono">{t.stop_loss}</span></div>
                </div>
                <p className="text-xs text-white/60">{t.thesis}</p>
              </div>
            ))}
            {event.trade_prediction.market_summary && (
              <p className="text-xs text-white/50 border-t border-white/10 pt-2 mt-1">{event.trade_prediction.market_summary}</p>
            )}
          </div>
          {!isElite && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900/60 backdrop-blur-sm rounded-xl">
              <div className="text-xs uppercase tracking-wide text-amber-400 mb-1">Elite feature</div>
              <div className="text-sm font-semibold text-white mb-3">AI trade predictions are Elite only</div>
              <a href="/pricing" className="rounded-full bg-amber-400 px-4 py-1.5 text-xs font-bold text-neutral-900 hover:bg-amber-300 transition-colors">
                Upgrade to Elite
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EventSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 animate-pulse">
      <div className="flex justify-between gap-2 mb-3">
        <div className="h-3 w-24 bg-white/10 rounded"></div>
        <div className="flex gap-2">
          <div className="h-4 w-16 bg-white/10 rounded-full"></div>
          <div className="h-4 w-20 bg-white/10 rounded-full"></div>
        </div>
      </div>
      <div className="space-y-2 mt-4">
        <div className="h-5 w-3/4 bg-white/10 rounded"></div>
        <div className="h-4 w-full bg-white/10 rounded mt-2"></div>
        <div className="h-4 w-5/6 bg-white/10 rounded"></div>
      </div>
    </div>
  );
}

export default function LiveFeedPage() {
  const [events, setEvents] = useState<SignalEvent[]>([]);
  const [calendarData, setCalendarData] = useState<SignalEvent[]>([]);
  const [activeTag, setActiveTag] = useState('all');
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [status, setStatus] = useState<StatusPayload | null>(null);
  const [isElite, setIsElite] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const loadEvents = useCallback(async (tag: string, pageNum: number, replace: boolean) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(pageNum * PAGE_SIZE) });
      if (tag !== 'all') params.set('tag', tag);
      const res = await fetch(`/api/events?${params}`);
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json() as { events: SignalEvent[] };
      const newEvents = data.events ?? [];
      setEvents(prev => replace ? newEvents : [...prev, ...newEvents]);
      setHasMore(newEvents.length === PAGE_SIZE);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch calendar events separately so they always show regardless of tag filter
  useEffect(() => {
    async function fetchCalendar() {
      try {
        const res = await fetch('/api/events?limit=50');
        if (!res.ok) return;
        const data = await res.json() as { events: SignalEvent[] };
        setCalendarData((data.events ?? []).filter(e => e.company === 'Forex Factory'));
      } catch { /* ignore */ }
    }
    fetchCalendar();
  }, []);

  useEffect(() => {
    setPage(0);
    loadEvents(activeTag, 0, true);
  }, [activeTag, loadEvents]);

  useEffect(() => {
    setPage(0);
  }, [activeFilter, searchQuery]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [statusRes, profileRes] = await Promise.all([
          fetch('/api/status'),
          fetch('/api/profile'),
        ]);
        if (statusRes.ok && mounted) {
          const data = await statusRes.json();
          setStatus(data as StatusPayload);
        }
        if (profileRes.ok && mounted) {
          const profile = await profileRes.json();
          setIsElite(profile.is_elite ?? false);
          setIsSubscribed(profile.is_subscribed ?? false);
          setProfileLoaded(true);
        }
      } catch { /* ignore */ }
    })();
    return () => { mounted = false; };
  }, []);

  function loadMore() {
    const next = page + 1;
    setPage(next);
    loadEvents(activeTag, next, false);
  }

  // Always use dedicated calendar fetch — falls back to events array if not loaded yet
  const calendarEvents = calendarData.length > 0
    ? calendarData
    : events.filter((e) => e.company === 'Forex Factory');

  const allSignalEvents = events.filter((e) => e.company !== 'Forex Factory');

  const filteredSignalEvents = useMemo(() => {
    let filtered = allSignalEvents;

    if (activeFilter === 'trade_prediction') {
      filtered = filtered.filter(e => e.trade_prediction);
    } else if (activeFilter === 'pairs_analysis') {
      filtered = filtered.filter(e => e.pairs_analysis);
    } else if (activeFilter === 'high_impact') {
      filtered = filtered.filter(e => (e.impact_score ?? 0) >= 4);
    } else if (activeFilter === 'bullish') {
      filtered = filtered.filter(e => e.sentiment === 'positive');
    } else if (activeFilter === 'bearish') {
      filtered = filtered.filter(e => e.sentiment === 'negative');
    } else if (activeFilter === 'sec') {
      filtered = filtered.filter(e => ['regulatory', 'insider_trading', 'ownership_change', 'merger_acquisition', 'management', 'earnings'].includes(e.primary_tag));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(e =>
        e.title?.toLowerCase().includes(q) ||
        e.company?.toLowerCase().includes(q) ||
        e.summary?.toLowerCase().includes(q) ||
        e.primary_tag?.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [allSignalEvents, activeFilter, searchQuery]);

  const FREE_LIMIT = 5;
  const signalEvents = isSubscribed ? filteredSignalEvents : filteredSignalEvents.slice(0, FREE_LIMIT);
  const isGated = !isSubscribed && filteredSignalEvents.length > FREE_LIMIT;
  const regulatoryCount = filteredSignalEvents.filter((e) => e.primary_tag === 'regulatory').length;
  const avgImpact = filteredSignalEvents.length ? (filteredSignalEvents.reduce((sum, e) => sum + (e.impact_score ?? 0), 0) / filteredSignalEvents.length).toFixed(1) : '—';
  const flashStatus = status?.collectors?.flash_sec;
  const foundryStatus = status?.collectors?.signal_foundry;
  const queuedDrips = status?.notifier?.queued_drips ?? 0;

  const todayCalendar = calendarEvents.filter((e) => {
    const d = new Date(e.published_at ?? '');
    const now = new Date();
    const diffMs = d.getTime() - now.getTime();
    return diffMs > -86400000 * 2 && diffMs < 86400000 * 7;
  }).sort((a, b) => new Date(a.published_at ?? '').getTime() - new Date(b.published_at ?? '').getTime()).slice(0, 20);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-neutral-950 p-6 text-white shadow-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="lg:w-1/2">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">Live feed</p>
            <h1 className="mt-2 text-2xl font-semibold leading-tight">Multi-source intel in one stream.</h1>
            <p className="mt-2 text-sm text-white/70">SEC filings, AI lab updates, fintech moves and economic calendar events — all in one place.</p>
          </div>
          <div className="grid flex-1 gap-3 text-sm text-white/80 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/15 bg-white/5 p-3">
              <div className="text-xs uppercase tracking-wide text-white/60">Signals</div>
              <div className="mt-1 text-2xl font-semibold">{filteredSignalEvents.length || '—'}</div>
              <p className="mt-0.5 text-xs text-white/60">Matching filters</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/5 p-3">
              <div className="text-xs uppercase tracking-wide text-white/60">Regulatory</div>
              <div className="mt-1 text-2xl font-semibold">{regulatoryCount}</div>
              <p className="mt-0.5 text-xs text-white/60">SEC sources</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/5 p-3">
              <div className="text-xs uppercase tracking-wide text-white/60">Avg impact</div>
              <div className="mt-1 text-2xl font-semibold">{avgImpact}</div>
              <p className="mt-0.5 text-xs text-white/60">Out of 5</p>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search signals by company, keyword or tag..."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30 pr-10"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs">
                ✕
              </button>
            )}
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/5 p-3">
            <div className="text-xs uppercase tracking-[0.3em] text-white/50 mb-2">Signal type</div>
            <div className="flex flex-wrap gap-1.5">
              {SIGNAL_FILTERS.map((filter) => {
                const isLocked = filter.elite && !isElite;
                return (
                  <button
                    key={filter.key}
                    onClick={() => !isLocked && setActiveFilter(filter.key)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors flex items-center gap-1 ${
                      activeFilter === filter.key
                        ? 'bg-white text-neutral-900'
                        : isLocked
                        ? 'bg-white/5 text-white/20 cursor-not-allowed'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {filter.elite && <span className="text-amber-400">⭐</span>}
                    {isLocked && <span>🔒</span>}
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/5 p-3">
            <div className="text-xs uppercase tracking-[0.3em] text-white/50 mb-2">Filter by tag</div>
            <div className="flex flex-wrap gap-1.5">
              {TAGS.map((tag) => (
                <button key={tag} onClick={() => setActiveTag(tag)} className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${activeTag === tag ? 'bg-white text-neutral-900' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {status && (
          <div className="mt-4 grid gap-3 text-sm text-white/80 md:grid-cols-3">
            <div className="rounded-2xl border border-emerald-300/40 bg-emerald-400/10 p-3">
              <div className="text-xs uppercase tracking-wide text-emerald-200">Flash SEC</div>
              <div className="mt-1 text-xl font-semibold text-white">{flashStatus?.new_records ?? '—'}</div>
              <p className="mt-0.5 text-xs text-white/70">last run {flashStatus?.last_run ? new Date(flashStatus.last_run).toLocaleTimeString() : '—'}</p>
            </div>
            <div className="rounded-2xl border border-sky-300/40 bg-sky-400/10 p-3">
              <div className="text-xs uppercase tracking-wide text-sky-200">RSS sources</div>
              <div className="mt-1 text-xl font-semibold text-white">{foundryStatus?.new_records ?? '—'}</div>
              <p className="mt-0.5 text-xs text-white/70">last run {foundryStatus?.last_run ? new Date(foundryStatus.last_run).toLocaleTimeString() : '—'}</p>
            </div>
            <div className="rounded-2xl border border-amber-300/40 bg-amber-400/10 p-3">
              <div className="text-xs uppercase tracking-wide text-amber-200">Delivery queue</div>
              <div className="mt-1 text-xl font-semibold text-white">{queuedDrips}</div>
              <p className="mt-0.5 text-xs text-white/70">Telegram {status.notifier.telegram}</p>
            </div>
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="space-y-3">
          {signalEvents.length === 0 && !loading ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
              <div className="text-white/50 text-sm mb-2">No signals match your filters</div>
              <button onClick={() => { setActiveTag('all'); setActiveFilter('all'); setSearchQuery(''); }} className="text-xs text-sky-400 hover:text-sky-300">
                Clear all filters
              </button>
            </div>
          ) : (
            signalEvents.map((event) => <EventCard key={event.id} event={event} isElite={isElite} />)
          )}
          {loading && (
            <div className="space-y-3">
              <EventSkeleton />
              <EventSkeleton />
              <EventSkeleton />
            </div>
          )}
          {isGated && profileLoaded && (
            <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
              <div className="blur-sm pointer-events-none select-none p-4 space-y-3">
                {allSignalEvents.slice(FREE_LIMIT, FREE_LIMIT + 3).map((event) => (
                  <div key={event.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white">{event.company}</span>
                      {event.primary_tag && <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-xs text-purple-200">{event.primary_tag}</span>}
                      {event.impact_score && <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-200">Impact {event.impact_score}</span>}
                    </div>
                    <div className="text-sm font-medium text-white">{event.title}</div>
                  </div>
                ))}
              </div>
              <div className="relative -mt-32 pb-6 px-6 flex flex-col items-center text-center bg-gradient-to-t from-neutral-950 via-neutral-950/95 to-transparent pt-20">
                <div className="text-xs uppercase tracking-wide text-white/50 mb-2">Free plan limit reached</div>
                <h3 className="text-lg font-semibold text-white mb-1">{filteredSignalEvents.length - FREE_LIMIT} more signals available today</h3>
                <p className="text-sm text-white/60 mb-3 max-w-sm">Pro members are seeing live SEC alerts, AI market analysis and trade setups for these signals right now.</p>
                <div className="grid grid-cols-3 gap-3 mb-4 w-full max-w-sm">
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-center">
                    <div className="text-lg font-bold text-emerald-400">73%</div>
                    <div className="text-xs text-white/50 mt-0.5">Signal accuracy</div>
                  </div>
                  <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-3 text-center">
                    <div className="text-lg font-bold text-sky-400">4 min</div>
                    <div className="text-xs text-white/50 mt-0.5">Avg alert speed</div>
                  </div>
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-center">
                    <div className="text-lg font-bold text-amber-400">28+</div>
                    <div className="text-xs text-white/50 mt-0.5">Live sources</div>
                  </div>
                </div>
                <div className="w-full max-w-sm mb-4">
                  <div className="text-xs uppercase tracking-wide text-white/40 mb-2 text-left">Live signal results</div>
                  <div className="rounded-xl border border-white/10 bg-black/30 overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs text-white/40 uppercase tracking-wide">Live results</span>
                    </div>
                    <RotatingBanner />
                  </div>
                </div>
                <div className="flex gap-3">
                  <a href="/pricing" className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-neutral-900 hover:bg-white/90 transition-colors">
                    Upgrade to Pro
                  </a>
                  <a href="/pricing" className="rounded-full border border-amber-400/40 bg-amber-400/10 px-5 py-2 text-sm font-medium text-amber-300 hover:bg-amber-400/20 transition-colors">
                    Get Elite
                  </a>
                </div>
              </div>
            </div>
          )}
          {!isGated && hasMore && !loading && signalEvents.length > 0 && (
            <div className="flex justify-center pt-2">
              <button onClick={loadMore} className="rounded-full border border-white/20 px-6 py-2 text-sm font-medium text-white/70 hover:bg-white/10">
                Load more signals
              </button>
            </div>
          )}
        </section>

        <aside className="space-y-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white sticky top-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs uppercase tracking-wide text-white/50">Economic calendar</div>
              <div className="flex items-center gap-2 text-xs text-white/40">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" /> High</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> Med</span>
              </div>
            </div>
            {todayCalendar.length === 0 ? (
              <div className="text-xs text-white/40 py-4 text-center">No upcoming events</div>
            ) : (
              <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
                {todayCalendar.map((event) => (
                  <CalendarCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
