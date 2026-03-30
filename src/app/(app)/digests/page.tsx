/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function DigestArchivePage() {
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

  const { data: events } = await supabase
    .from('sf_events')
    .select('id, title, company, primary_tag, impact_score, published_at, link, summary')
    .order('published_at', { ascending: false })
    .limit(200);

  const byDate: Record<string, typeof events> = {};
  for (const event of events ?? []) {
    const date = event.published_at?.slice(0, 10) ?? 'unknown';
    if (!byDate[date]) byDate[date] = [];
    byDate[date]!.push(event);
  }

  const dates = Object.keys(byDate).sort((a, b) => b.localeCompare(a));

  return (
    <div>
      <h1 className="text-2xl font-semibold">Digest Archive</h1>
      <p className="mt-2 text-sm text-neutral-500">Daily signal digests — grouped by date, newest first.</p>
      {dates.length === 0 ? (
        <div className="mt-6 rounded-md border p-4 text-sm text-neutral-500">No digests yet.</div>
      ) : (
        <div className="mt-8 space-y-6">
          {dates.map((date) => {
            const dayEvents = byDate[date] ?? [];
            const topTags = Array.from(new Set(dayEvents.map((e) => e.primary_tag).filter(Boolean))).slice(0, 4);
            const companies = Array.from(new Set(dayEvents.map((e) => e.company).filter(Boolean))).slice(0, 5);
            const allCompanies = Array.from(new Set(dayEvents.map((e) => e.company)));
            return (
              <div key={date} className="rounded-lg border p-5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <div className="font-semibold">
                      {new Date(date).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <div className="mt-1 text-sm text-neutral-500">
                      {dayEvents.length} signal{dayEvents.length !== 1 ? 's' : ''} — {companies.join(', ')}{companies.length < allCompanies.length ? '…' : ''}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {topTags.map((tag) => (
                      <span key={tag} className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  {dayEvents.slice(0, 5).map((event, idx) => (
                    <div key={event.id ?? idx} className="flex items-start justify-between gap-4 rounded-md border p-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 mb-1">
                          <span className="font-medium text-neutral-700">{event.company}</span>
                          {event.primary_tag && <span className="rounded-full bg-neutral-100 px-2 py-0.5">{event.primary_tag}</span>}
                          {event.impact_score && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">Impact {event.impact_score}</span>}
                        </div>
                        <div className="text-sm font-medium truncate">{event.title}</div>
                        {event.summary && <div className="mt-1 text-xs text-neutral-500 line-clamp-2">{event.summary}</div>}
                      </div>
                      {event.link && <a href={event.link} target="_blank" rel="noreferrer" className="shrink-0 text-xs text-blue-600 hover:underline">Source →</a>}
                    </div>
                  ))}
                  {dayEvents.length > 5 && <div className="text-xs text-neutral-400 pt-1">+{dayEvents.length - 5} more signals this day</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
