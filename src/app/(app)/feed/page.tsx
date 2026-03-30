'use client';

import { useEffect, useState, useCallback } from 'react';
import type { SignalEvent } from '@/lib/types';

const TAGS = ['all', 'product', 'regulatory', 'funding', 'pricing', 'security', 'partnership', 'talent', 'general'];
const PAGE_SIZE = 25;

const sentimentColors: Record<string, string> = {
  positive: 'text-emerald-600',
  neutral: 'text-neutral-500',
  negative: 'text-rose-600',
};

function EventCard({ event }: { event: SignalEvent }) {
  return (
    <div className="rounded-md border p-4 hover:border-neutral-400 transition-colors">
      <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
        <span className="font-mono">
          {event.published_at && !event.published_at.includes('1970')
            ? new Date(event.published_at).toLocaleString()
            : new Date(event.fetched_at ?? '').toLocaleString()}
        </span>
        <span>• {event.company}</span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <a
          href={event.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold hover:underline"
        >
          {event.title}
        </a>
        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
          {event.primary_tag}
        </span>
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
          Impact {event.impact_score}
        </span>
        <span className={`text-xs font-medium ${sentimentColors[event.sentiment] ?? ''}`}>
          {event.sentiment}
        </span>
      </div>
      {event.summary && (
        <p className="mt-2 text-sm text-neutral-700 line-clamp-2">{event.summary}</p>
      )}
      <div className="mt-3 flex flex-wrap gap-1 text-xs text-neutral-500">
        {event.tags.map((tag) => (
          <span key={tag} className="rounded bg-neutral-100 px-2 py-0.5">
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function LiveFeedPage() {
  const [events, setEvents] = useState<SignalEvent[]>([]);
  const [activeTag, setActiveTag] = useState('all');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadEvents = useCallback(async (tag: string, pageNum: number, replace: boolean) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(pageNum * PAGE_SIZE),
      });
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

  function loadMore() {
    const next = page + 1;
    setPage(next);
    loadEvents(activeTag, next, false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Live Feed</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Live signals from SEC filings and competitive intelligence.
        </p>
      </div>

      {/* Tag filters */}
      <div className="flex flex-wrap gap-2">
        {TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              activeTag === tag
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Events */}
      <div className="space-y-3">
        {events.length === 0 && !loading ? (
          <div className="rounded-md border p-4 text-sm text-neutral-600">
            No events found{activeTag !== 'all' ? ` for tag: ${activeTag}` : ''}.
          </div>
        ) : (
          events.map((event) => <EventCard key={event.id} event={event} />)
        )}

        {loading && (
          <div className="rounded-md border p-4 text-sm text-neutral-500 text-center">
            Loading...
          </div>
        )}
      </div>

      {/* Load more */}
      {hasMore && !loading && events.length > 0 && (
        <div className="flex justify-center pt-2">
          <button
            onClick={loadMore}
            className="rounded-md border px-6 py-2 text-sm font-medium hover:bg-neutral-50 transition-colors"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
