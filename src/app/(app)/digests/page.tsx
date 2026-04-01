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
    .select('id, title, company, primary_tag, impact_score, published, fetched_at, link, summary')
    .order('fetched_at', { ascending: false })
    .limit(200);

  const byDate: Record<string, typeof events> = {};
  for (const event of events ?? []) {
    const raw = event.published ?? event.fetched_at;
    const parsed = raw ? new Date(raw) : null;
    const date = parsed && !isNaN(parsed.getTime()) ? parsed.toISOString().slice(0, 10) : 'unknown';
    if (!byDate[date]) byDate[date] = [];
    byDate[date]!.push(event);
  }

  const dates = Object.keys(byDate).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-neutral-950 p-8 text-white shadow-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Digest archive</p>
        <h1 className="mt-3 text-3xl font-semibold">Daily recaps of market-moving signals.</h1>
        <p className="mt-3 text-sm text-white/70">
          Each digest bundles SEC filings, product launches, and regulatory notes into a daily brief. Pull
          highlights for your team or push the archive to BI tooling.
        </p>
      </section>
      {dates.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 text-sm text-neutral-600">
          No digests yet.
        </div>
      ) : (
        <div className="space-y-6">
          {dates.map((date) => {
            const dayEvents = byDate[date] ?? [];
            const topTags = Array.from(new Set(dayEvents.map((e) => e.primary_tag).filter(Boolean))).slice(0, 4);
            const companies = Array.from(new Set(dayEvents.map((e) => e.company).filter(Boolean))).slice(0, 5);
            const allCompanies = Array.from(new Set(dayEvents.map((e) => e.company)));
            return (
              <div key={date} className="rounded-3xl border border-white/10 bg-neutral-950 p-6 text-white shadow-lg">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-sm uppercase tracking-[0.3em] text-white/50">{date === 'unknown' ? 'Unknown date' : new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(date + 'T12:00:00'))}</div>
                    <div className="mt-2 text-lg font-semibold text-white">
                      {dayEvents.length} signal{dayEvents.length !== 1 ? 's' : ''} — {companies.join(', ')}
                      {companies.length < allCompanies.length ? '…' : ''}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {topTags.map((tag) => (
                      <span key={tag} className="rounded-full border border-white/20 px-3 py-1 text-white/80">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  {dayEvents.slice(0, 5).map((event, idx) => (
                    <div key={event.id ?? idx} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-white/70">
                        <span className="font-semibold text-white">{event.company}</span>
                        {event.primary_tag && (
                          <span className="rounded-full bg-white/10 px-2 py-0.5">{event.primary_tag}</span>
                        )}
                        {event.impact_score && (
                          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-amber-200">
                            Impact {event.impact_score}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-white line-clamp-1">{event.title}</div>
                          {event.summary && <div className="mt-1 text-xs text-white/60 line-clamp-2">{event.summary}</div>}
                        </div>
                        {event.link && (
                          <a href={event.link} target="_blank" rel="noreferrer" className="text-xs text-sky-300 hover:text-sky-200">
                            Source →
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                  {dayEvents.length > 5 && (
                    <div className="text-xs text-white/60">+{dayEvents.length - 5} more signals logged for this day</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
