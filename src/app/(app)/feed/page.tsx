import { fetchEvents, fetchHighlights } from '@/lib/signal-store';
import type { Highlight, SignalEvent } from '@/lib/types';

export const dynamic = 'force-dynamic';

const sentimentColors: Record<string, string> = {
  positive: 'text-emerald-600',
  neutral: 'text-neutral-500',
  negative: 'text-rose-600',
};

function EventCard({ event }: { event: SignalEvent }) {
  return (
    <div className="rounded-md border p-4">
      <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
        <span className="font-mono">{new Date(event.published_at).toLocaleString()}</span>
        <span>• {event.company}</span>
        <span>• {event.source}</span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <div className="font-semibold">{event.title}</div>
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
      <p className="mt-2 text-sm text-neutral-700">{event.summary}</p>
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

function HighlightCard({ highlight }: { highlight: Highlight }) {
  return (
    <div className="rounded-md border p-3 text-sm">
      <div className="flex items-center justify-between text-xs text-neutral-500">
        <span>{highlight.ticker}</span>
        <span className="text-neutral-600">{highlight.catalyst}</span>
      </div>
      <div className="mt-1 font-medium">{highlight.title}</div>
      <p className="mt-1 text-neutral-600">{highlight.summary}</p>
      <div className="mt-2 text-xs text-neutral-500">Score {highlight.score}</div>
      <p className="mt-2 text-neutral-700">{highlight.suggested_copy}</p>
    </div>
  );
}

export default async function LiveFeedPage() {
  let events: SignalEvent[] = [];
  let highlights: Highlight[] = [];

  try {
    const [ev, hi] = await Promise.all([
      fetchEvents({ limit: 25 }),
      fetchHighlights({ limit: 5 }),
    ]);
    events = ev.events;
    highlights = hi;
  } catch (err) {
    console.error('feed page error:', err);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
      <section>
        <h1 className="text-2xl font-semibold">Live Feed</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Live signals from SEC filings and competitive intelligence.
        </p>
        <div className="mt-6 space-y-3">
          {events.length === 0 ? (
            <div className="rounded-md border p-4 text-sm text-neutral-600">
              No events yet.
            </div>
          ) : (
            events.map((event) => <EventCard key={event.id} event={event} />)
          )}
        </div>
      </section>
      <aside>
        <h2 className="text-lg font-semibold">Highlights</h2>
        <div className="mt-4 space-y-2">
          {highlights.length === 0 ? (
            <div className="rounded-md border p-4 text-sm text-neutral-600">No highlights yet.</div>
          ) : (
            highlights.map((highlight) => (
              <HighlightCard key={`${highlight.ticker}-${highlight.catalyst}`} highlight={highlight} />
            ))
          )}
        </div>
      </aside>
    </div>
  );
}
