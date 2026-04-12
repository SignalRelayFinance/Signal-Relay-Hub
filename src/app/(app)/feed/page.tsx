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

function EventCard({ event }: { event: SignalEvent }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-white shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-white/60">
        <div className="font-mono">
          {event.published_at && !event.published_at.includes('1970')
            ? new Date(event.published_at).toLocaleString()
            : new Date(event.fetched_at ?? '').toLocaleString()}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-white">{event.company}</span>
          {event.primary_tag && <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-xs text-purple-200">{event.primary_tag}</span>}
          {event.impact_score && <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-200">Impact {event.impact_score}</span>}
          <span className={`text-xs font-semibold ${sentimentColors[event.sentiment] ?? ''}`}>{event.sentiment}</span>
        </div>
      </div>
      <div className="mt-3">
        <a href={event.source_url} target="_blank" rel="noopener noreferrer" className="text-lg font-semibold text-white hover:text-sky-200">
          {event.title}
        </a>
        {event.summary && <p className="mt-2 text-sm text-white/70 line-clamp-2">{event.summary}</p>}
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/70">
        {event.tags.map((tag) => (
          <span key={tag} className="rounded-full border border-white/15 px-3 py-1">#{tag}</span>
        ))}
      </div>
      {event.pairs_analysis && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="text-xs uppercase tracking-wide text-white/50 mb-2">Market impact</div>
          <div className="flex flex-wrap gap-2">
            {event.pairs_analysis.pairs?.map((p) => (
              <div key={p.pair} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                <span className="text-xs font-mono font-medium text-white">{p.pair}</span>
                <span className={`text-xs font-bold ${p.direction === 'bullish' ? 'text-emerald-400' : p.direction === 'bearish' ? 'text-rose-400' : 'text-white/50'}`}>
                  {p.direction === 'bullish' ? '▲' : p.direction === 'bearish' ? '▼' : '—'}{'●'.repeat(p.strength)}
                </span>
                <span className="text-xs text-white/40">{p.reason}</span>
              </div>
            ))}
          </div>
          {event.pairs_analysis.overall && <p className="mt-2 text-xs text-white/60">{event.pairs_analysis.overall}</p>}
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
      } catch {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  function loadMore() {
    const next = page + 1;
    setPage(next);
    loadEvents(activeTag, next, false);
  }

  const regulatoryCount = events.filter((e) => e.primary_tag === 'regulatory').length;
  const avgImpact = events.length ? (events.reduce((sum, e) => sum + (e.impact_score ?? 0), 0) / events.length).toFixed(1) : '—';
  const flashStatus = status?.collectors?.flash_sec;
  const foundryStatus = status?.collectors?.signal_foundry;
  const queuedDrips = status?.notifier?.queued_drips ?? 0;

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-neutral-950 p-8 text-white shadow-xl">
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="lg:w-2/3">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">Live feed</p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight">Multi-source intel in one stream.</h1>
            <p className="mt-3 text-sm text-white/70">Fresh SEC filings, competitor pricing moves, and AI lab updates. Filter by tag or sentiment and push anything to Telegram in seconds.</p>
          </div>
          <div className="grid flex-1 gap-4 text-sm text-white/80 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-wide text-white/60">Signals loaded</div>
              <div className="mt-2 text-2xl font-semibold">{events.length || '—'}</div>
              <p className="mt-1 text-xs text-white/60">Current page</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-wide text-white/60">Regulatory</div>
              <div className="mt-2 text-2xl font-semibold">{regulatoryCount}</div>
              <p className="mt-1 text-xs text-white/60">With SEC sources</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-wide text-white/60">Avg impact</div>
              <div className="mt-2 text-2xl font-semibold">{avgImpact}</div>
              <p className="mt-1 text-xs text-white/60">Out of 5</p>
            </div>
          </div>
        </div>
        <div className="mt-6 rounded-2xl border border-white/15 bg-white/5 p-4">
          <div className="text-xs uppercase tracking-[0.3em] text-white/50">Filter by tag</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {TAGS.map((tag) => (
              <button key={tag} onClick={() => setActiveTag(tag)} className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${activeTag === tag ? 'bg-white text-neutral-900' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                {tag}
              </button>
            ))}
          </div>
        </div>
        {status && (
          <div className="mt-6 grid gap-4 text-sm text-white/80 md:grid-cols-3">
            <div className="rounded-2xl border border-emerald-300/40 bg-emerald-400/10 p-4">
              <div className="text-xs uppercase tracking-wide text-emerald-200">Flash SEC collector</div>
              <div className="mt-2 text-2xl font-semibold text-white">{flashStatus?.new_records ?? '—'}</div>
              <p className="mt-1 text-xs text-white/70">filings in last 24h • last run {flashStatus?.last_run ? new Date(flashStatus.last_run).toLocaleTimeString() : '—'}</p>
            </div>
            <div className="rounded-2xl border border-sky-300/40 bg-sky-400/10 p-4">
              <div className="text-xs uppercase tracking-wide text-sky-200">SignalFoundry RSS</div>
              <div className="mt-2 text-2xl font-semibold text-white">{foundryStatus?.new_records ?? '—'}</div>
              <p className="mt-1 text-xs text-white/70">new stories • last run {foundryStatus?.last_run ? new Date(foundryStatus.last_run).toLocaleTimeString() : '—'}</p>
            </div>
            <div className="rounded-2xl border border-amber-300/40 bg-amber-400/10 p-4">
              <div className="text-xs uppercase tracking-wide text-amber-200">Delivery queue</div>
              <div className="mt-2 text-2xl font-semibold text-white">{queuedDrips}</div>
              <p className="mt-1 text-xs text-white/70">drips waiting • Telegram {status.notifier.telegram}</p>
            </div>
          </div>
        )}
      </section>
      <section className="space-y-4">
        {events.length === 0 && !loading ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 text-sm text-neutral-600">No events found{activeTag !== 'all' ? ` for tag: ${activeTag}` : ''}.</div>
        ) : (
          events.map((event) => <EventCard key={event.id} event={event} />)
        )}
        {loading && <div className="rounded-2xl border border-neutral-200 bg-white p-5 text-center text-sm text-neutral-500">Loading…</div>}
      </section>
      {hasMore && !loading && events.length > 0 && (
        <div className="flex justify-center pt-2">
          <button onClick={loadMore} className="rounded-full border border-neutral-300 px-6 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
            Load more signals
          </button>
        </div>
      )}
    </div>
  );
}
