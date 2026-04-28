/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';

type DigestEvent = {
  id: string;
  title: string;
  company: string;
  primary_tag: string;
  impact_score: number;
  published: string;
  published_at: string;
  fetched_at: string;
  link: string;
  summary: string;
};

function formatDisplayDate(dateStr: string) {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateStr + 'T12:00:00'));
}

function toLocalDateStr(date: Date) {
  return date.toISOString().slice(0, 10);
}

function isWithinDays(dateStr: string, days: number): boolean {
  const date = new Date(dateStr + 'T12:00:00');
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return date >= cutoff;
}

export default function DigestArchivePage() {
  const today = toLocalDateStr(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [events, setEvents] = useState<DigestEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const FREE_DAY_LIMIT = 3;

  useEffect(() => {
    fetch('/api/profile').then(r => r.json()).then(p => {
      setIsSubscribed(p.is_subscribed ?? false);
      setProfileLoaded(true);
    }).catch(() => setProfileLoaded(true));
  }, []);

  useEffect(() => {
    // Generate last 30 days as available dates
    const dates: string[] = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(toLocalDateStr(d));
    }
    setAvailableDates(dates);
  }, []);

  useEffect(() => {
    async function fetchEvents() {
      if (!profileLoaded) return;
      if (!isSubscribed && !isWithinDays(selectedDate, FREE_DAY_LIMIT)) return;
      setLoading(true);
      try {
        const res = await fetch('/api/events?limit=500');
        if (!res.ok) return;
        const data = await res.json();
        setEvents(data.events ?? []);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, [selectedDate, isSubscribed, profileLoaded]);

  const isDateLocked = profileLoaded && !isSubscribed && !isWithinDays(selectedDate, FREE_DAY_LIMIT);
  const signalEvents = events.filter(e => (e as any).company !== 'Forex Factory');
  const calendarEvents = events.filter(e => (e as any).company === 'Forex Factory');
  const topTags = Array.from(new Set(signalEvents.map(e => e.primary_tag).filter(Boolean))).slice(0, 5);
  const companies = Array.from(new Set(signalEvents.map(e => e.company).filter(Boolean))).slice(0, 6);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-neutral-950 p-8 text-white shadow-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Digest Archive</p>
        <h1 className="mt-3 text-3xl font-semibold">Daily recaps of market-moving signals.</h1>
        <p className="mt-3 text-sm text-white/70">
          Pick a date to see all signals, SEC filings, and economic events from that day.
          {!isSubscribed && profileLoaded && (
            <span className="text-amber-400"> Free plan shows last {FREE_DAY_LIMIT} days. </span>
          )}
        </p>
      </section>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="text-xs uppercase tracking-wide text-white/50">Select date</div>
            <input
              type="date"
              value={selectedDate}
              max={today}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 [color-scheme:dark]"
            />
          </div>
          <button
            onClick={() => setSelectedDate(today)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${selectedDate === today ? 'bg-white text-neutral-900' : 'border border-white/20 text-white/70 hover:bg-white/10'}`}
          >
            Today
          </button>
          <div className="flex flex-wrap gap-2">
            {availableDates.slice(0, 7).map((date) => {
              const locked = profileLoaded && !isSubscribed && !isWithinDays(date, FREE_DAY_LIMIT);
              return (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`rounded-full px-3 py-1 text-xs transition-colors flex items-center gap-1 ${
                    selectedDate === date ? 'bg-white text-neutral-900' :
                    locked ? 'border border-white/10 text-white/20 cursor-not-allowed' :
                    'border border-white/10 text-white/50 hover:bg-white/10'
                  }`}
                >
                  {locked && <span>🔒</span>}
                  {new Date(date + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {isDateLocked ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="blur-sm pointer-events-none select-none p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex gap-2 mb-2">
                  <div className="h-4 w-20 rounded bg-white/10" />
                  <div className="h-4 w-16 rounded bg-purple-500/20" />
                </div>
                <div className="h-4 w-3/4 rounded bg-white/10 mb-1" />
                <div className="h-3 w-1/2 rounded bg-white/5" />
              </div>
            ))}
          </div>
          <div className="relative -mt-32 pb-8 px-6 flex flex-col items-center text-center bg-gradient-to-t from-neutral-950 via-neutral-950/95 to-transparent pt-20">
            <div className="text-2xl mb-3">🔒</div>
            <div className="text-xs uppercase tracking-wide text-white/50 mb-2">Pro feature</div>
            <h3 className="text-lg font-semibold text-white mb-1">Full archive access requires Pro</h3>
            <p className="text-sm text-white/60 mb-4 max-w-sm">Free plan shows the last {FREE_DAY_LIMIT} days. Upgrade to Pro to access the complete signal history archive.</p>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300">Full archive history</div>
              <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 px-3 py-1.5 text-xs text-sky-300">SEC filing archive</div>
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-300">Economic calendar history</div>
            </div>
            <a href="/pricing" className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-neutral-900 hover:bg-white/90 transition-colors">
              Upgrade to Pro — £45/mo
            </a>
          </div>
        </div>
      ) : loading ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-sm text-white/50">
          Loading signals...
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-neutral-950 p-5 text-white">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-wide text-white/50">
                  {formatDisplayDate(selectedDate)}
                </div>
                <div className="mt-1 text-lg font-semibold">
                  {signalEvents.length} signal{signalEvents.length !== 1 ? 's' : ''}
                  {calendarEvents.length > 0 && ` + ${calendarEvents.length} economic events`}
                </div>
                {companies.length > 0 && (
                  <div className="mt-1 text-xs text-white/50">{companies.join(', ')}</div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {topTags.map((tag) => (
                  <span key={tag} className="rounded-full border border-white/15 px-2 py-0.5 text-xs text-white/60">{tag}</span>
                ))}
              </div>
            </div>
          </div>

          {signalEvents.length === 0 && calendarEvents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-8 text-center">
              <div className="text-white/50 text-sm">No signals found for {formatDisplayDate(selectedDate)}</div>
              <p className="mt-2 text-xs text-white/30">Try selecting a different date using the calendar above.</p>
            </div>
          ) : (
            <>
              {signalEvents.length > 0 && (
                <div className="space-y-3">
                  <div className="text-xs uppercase tracking-wide text-white/40 px-1">Signals</div>
                  {signalEvents.map((event, idx) => (
                    <div key={event.id ?? idx} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
                        <span className="font-semibold text-white">{event.company}</span>
                        {event.primary_tag && (
                          <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-purple-200">{event.primary_tag}</span>
                        )}
                        {event.impact_score && (
                          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-amber-200">Impact {event.impact_score}</span>
                        )}
                        <span className="text-white/30">
                          {event.published ? new Date(event.published).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-white">{event.title}</div>
                          {event.summary && <div className="mt-1 text-xs text-white/50 line-clamp-2">{event.summary}</div>}
                        </div>
                        {event.link && (
                          <a href={event.link} target="_blank" rel="noreferrer" className="text-xs text-sky-400 hover:text-sky-300 shrink-0">
                            Source →
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {calendarEvents.length > 0 && (
                <div className="space-y-3">
                  <div className="text-xs uppercase tracking-wide text-white/40 px-1">Economic events</div>
                  {calendarEvents.map((event, idx) => (
                    <div key={event.id ?? idx} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-white/40">
                          {event.published ? new Date(event.published).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                        <span className="text-sm font-medium">{event.title}</span>
                        {event.impact_score && (
                          <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-200 ml-auto">Impact {event.impact_score}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
