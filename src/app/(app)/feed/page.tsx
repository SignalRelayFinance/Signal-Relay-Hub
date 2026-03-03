import { fetchEvents, fetchHighlights } from '@/lib/signal-api';

export const dynamic = 'force-dynamic';

export default async function LiveFeedPage() {
  let events: Awaited<ReturnType<typeof fetchEvents>>['events'] = [];
  let highlights: string[] = [];

  try {
    const [ev, hi] = await Promise.all([fetchEvents({ limit: 25 }), fetchHighlights()]);
    events = ev.events;
    highlights = hi.highlights;
  } catch {
    // backend not wired yet
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
      <section>
        <h1 className="text-2xl font-semibold">Live Feed</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Pulling from /api/events (via NEXT_PUBLIC_SIGNAL_API_BASE_URL if set).
        </p>

        <div className="mt-6 space-y-3">
          {events.length === 0 ? (
            <div className="rounded-md border p-4 text-sm text-neutral-600">
              No events yet (API not wired). Add NEXT_PUBLIC_SIGNAL_API_BASE_URL and implement
              /api/events.
            </div>
          ) : (
            events.map((e) => (
              <div key={e.id} className="rounded-md border p-4">
                <div className="text-xs text-neutral-500">{e.ts}</div>
                <div className="mt-1 font-medium">{e.title || e.type}</div>
                <pre className="mt-2 overflow-auto text-xs text-neutral-700">
                  {JSON.stringify(e.body ?? {}, null, 2)}
                </pre>
              </div>
            ))
          )}
        </div>
      </section>

      <aside>
        <h2 className="text-lg font-semibold">Highlights</h2>
        <div className="mt-4 space-y-2">
          {highlights.length === 0 ? (
            <div className="rounded-md border p-4 text-sm text-neutral-600">No highlights yet.</div>
          ) : (
            highlights.map((h, idx) => (
              <div key={idx} className="rounded-md border p-3 text-sm">
                {h}
              </div>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}
