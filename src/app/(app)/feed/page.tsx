/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, useCallback } from 'react';
import type { SignalEvent, StatusPayload } from '@/lib/types';

const TAGS = ['all', 'product', 'regulatory', 'funding', 'pricing', 'security', 'partnership', 'talent', 'general'];
const PAGE_SIZE = 25;

const sentimentColors: Record<string, string> = {
  positive: 'text-emerald-300',
  neutral: 'text-white/70',
  negative: 'text-rose-300',
};

const impactColors: Record<string, string> = {
  High: 'bg-rose-500',
  Medium: 'bg-amber-500',
  Low: 'bg-yellow-500',
};

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
          {event.published_at ? new Date(event.published_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '—'}
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

function EventCard({ event }: { event: SignalEvent }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-white/60">
        <div className="font-mono text-xs">
          {event.published_at && !event.published_at.includes('1970')
            ? new Date(event.published_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
            : new Date(event.fetched_at ?? '').toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-white">{event.company}</span>
          {event.primary_tag && <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-xs text-purple-200">{event.primary_tag}</span>}
          {event.impact_score && <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-200">Impact {event.impact_score}</span>}
          <span className={`text-xs font-semibold ${sentimentColors[event.sentiment] ?? ''}`}>{event.sentiment}</span>
        </div>
      </div>
      <div className="mt-2">
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
              <div key={p.pair} className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5">
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
    </div>
  );
}

export default function LiveFeedPage() {
  const [events, setEvents] = useState<SignalEvent[]>([]);
  const [activeTag, setActiveTag] = useState('all');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [status, setStatus] = useState<StatusPayload | null>(null);

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

  useEffect(() => {
    setPage(0);
    loadEvents(activeTag, 0, true);
  }, [activeTag, loadEvents]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/status');
        if (!res.ok) return;
        const data = await res.json();
        if (mounted) setStatus(data as StatusPayload);
      } catch { /* ignore */ }
    })();
    return () => { mounted = false; };
  }, []);

  function loadMore() {
    const next = page + 1;
    setPage(next);
    loadEvents(activeTag, next, false);
  }

  const calendarEvents = events.filter((e) => e.company === 'Forex Factory');
  const signalEvents = events.filter((e) => e.company !== 'Forex Factory');
  const regulatoryCount = signalEvents.filter((e) => e.primary_tag === 'regulatory').length;
  const avgImpact = signalEvents.length ? (signalEvents.reduce((sum, e) => sum + (e.impact_score ?? 0), 0) / signalEvents.length).toFixed(1) : '—';
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
              <div className="mt-1 text-2xl font-semibold">{signalEvents.length || '—'}</div>
              <p className="mt-0.5 text-xs text-white/60">This page</p>
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
        <div className="mt-4 rounded-2xl border border-white/15 bg-white/5 p-3">
          <div className="text-xs uppercase tracking-[0.3em] text-white/50 mb-2">Filter by tag</div>
          <div className="flex flex-wrap gap-1.5">
            {TAGS.map((tag) => (
              <button key={tag} onClick={() => setActiveTag(tag)} className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${activeTag === tag ? 'bg-white text-neutral-900' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                {tag}
              </button>
            ))}
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
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/50">No signals found{activeTag !== 'all' ? ` for tag: ${activeTag}` : ''}.</div>
          ) : (
            signalEvents.map((event) => <EventCard key={event.id} event={event} />)
          )}
          {loading && <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center text-sm text-white/50">Loading…</div>}
          {hasMore && !loading && signalEvents.length > 0 && (
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
