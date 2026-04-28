/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import type { SignalEvent } from '@/lib/types';

const PAIRS_FILTER = ['all', 'XAUUSD', 'EURUSD', 'BTCUSD', 'GBPUSD', 'USOIL', 'US30', 'ETHUSD'];
const SENTIMENT_FILTER = ['all', 'bullish', 'bearish', 'neutral'];

type ChatMessage = {
  id: string;
  user: string;
  message: string;
  timestamp: Date;
  badge: 'Elite' | 'Pro' | 'Free';
  pair?: string;
};

const DEMO_MESSAGES: ChatMessage[] = [
  { id: '1', user: 'TraderJoe', message: 'XAUUSD looking strong above 4720, watching for break of 4740 resistance', timestamp: new Date(Date.now() - 5 * 60000), badge: 'Elite', pair: 'XAUUSD' },
  { id: '2', user: 'FXHunter', message: 'That Fed signal earlier was massive, EUR still under pressure', timestamp: new Date(Date.now() - 3 * 60000), badge: 'Pro', pair: 'EURUSD' },
  { id: '3', user: 'CryptoKing', message: 'BTC holding 75k support, next leg up incoming if retail sales beat', timestamp: new Date(Date.now() - 2 * 60000), badge: 'Pro', pair: 'BTCUSD' },
  { id: '4', user: 'ScalpMaster', message: 'Anyone watching the BOE signal? GBP setup looks clean for a short', timestamp: new Date(Date.now() - 1 * 60000), badge: 'Elite', pair: 'GBPUSD' },
];

function BadgePill({ badge }: { badge: 'Elite' | 'Pro' | 'Free' }) {
  if (badge === 'Elite') return <span className="rounded-full bg-amber-400/20 border border-amber-400/30 px-1.5 py-0.5 text-xs font-bold text-amber-400">⭐ Elite</span>;
  if (badge === 'Pro') return <span className="rounded-full bg-sky-400/20 border border-sky-400/30 px-1.5 py-0.5 text-xs font-bold text-sky-400">Pro</span>;
  return <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-xs text-white/40">Free</span>;
}

function SignalCard({ event, isElite, isSubscribed }: { event: SignalEvent; isElite: boolean; isSubscribed: boolean }) {
  const isPositive = event.sentiment === 'positive';
  const isNegative = event.sentiment === 'negative';

  const cardBorder = isPositive
    ? 'border-emerald-500/40 shadow-emerald-500/10 shadow-lg'
    : isNegative
    ? 'border-rose-500/40 shadow-rose-500/10 shadow-lg'
    : 'border-white/10';

  const sentimentLabel = isPositive ? '▲ Bullish' : isNegative ? '▼ Bearish' : '— Neutral';
  const sentimentColor = isPositive ? 'text-emerald-400' : isNegative ? 'text-rose-400' : 'text-white/50';

  const impactLabel = (event.impact_score ?? 0) >= 5 ? 'Critical'
    : (event.impact_score ?? 0) >= 4 ? 'High'
    : (event.impact_score ?? 0) >= 3 ? 'Moderate'
    : 'Low';

  return (
    <div className={`rounded-2xl border bg-white/5 p-4 text-white ${cardBorder}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-white/40">
            {event.published_at && !event.published_at.includes('1970')
              ? new Date(event.published_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
              : new Date(event.fetched_at ?? '').toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-white">{event.company}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {event.impact_score && (
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold border ${(event.impact_score ?? 0) >= 4 ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'}`}>
              {impactLabel}
            </span>
          )}
          <span className={`text-xs font-bold ${sentimentColor}`}>{sentimentLabel}</span>
        </div>
      </div>

      <a href={event.source_url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-white hover:text-sky-200 leading-snug">
        {event.title}
      </a>
      {event.summary && <p className="mt-1 text-xs text-white/50 line-clamp-2">{event.summary}</p>}

      {event.pairs_analysis && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {event.pairs_analysis.pairs?.map((p: any) => (
            <div key={p.pair} className={`flex items-center gap-1 rounded-full border px-2.5 py-1 ${p.direction === 'bullish' ? 'border-emerald-500/30 bg-emerald-500/10' : p.direction === 'bearish' ? 'border-rose-500/30 bg-rose-500/10' : 'border-white/10 bg-white/5'}`}>
              <span className="text-xs font-mono font-bold text-white">{p.pair}</span>
              <span className={`text-xs font-bold ${p.direction === 'bullish' ? 'text-emerald-400' : p.direction === 'bearish' ? 'text-rose-400' : 'text-white/50'}`}>
                {p.direction === 'bullish' ? '▲' : p.direction === 'bearish' ? '▼' : '—'}{'●'.repeat(p.strength ?? 1)}
              </span>
            </div>
          ))}
          {event.pairs_analysis.overall && (
            <p className="w-full mt-1 text-xs text-white/40 italic">{event.pairs_analysis.overall}</p>
          )}
        </div>
      )}

      {event.trade_prediction && (
        <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 relative overflow-hidden">
          <div className="text-xs uppercase tracking-wide text-amber-400/70 mb-2">⭐ Elite trade setup</div>
          <div className={isElite ? '' : 'blur-sm pointer-events-none select-none'}>
            {event.trade_prediction.trades?.map((t: any) => (
              <div key={t.pair} className="mb-2 last:mb-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-white">{t.pair}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${t.direction === 'long' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {t.direction === 'long' ? '▲ LONG' : '▼ SHORT'}
                  </span>
                  <span className="text-xs text-white/40">{t.timeframe}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div><span className="text-white/40">Entry </span><span className="text-white/80 font-mono">{t.entry_zone}</span></div>
                  <div><span className="text-white/40">Target </span><span className="text-emerald-400 font-mono">{t.target}</span></div>
                  <div><span className="text-white/40">Stop </span><span className="text-rose-400 font-mono">{t.stop_loss}</span></div>
                </div>
              </div>
            ))}
          </div>
          {!isElite && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900/70 backdrop-blur-sm rounded-xl">
              <div className="text-xs text-amber-400 mb-1">⭐ Elite only</div>
              <a href="/pricing" className="rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-neutral-900">
                Upgrade to Elite
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TraderCirclePage() {
  const [events, setEvents] = useState<SignalEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [activePair, setActivePair] = useState('all');
  const [activeSentiment, setActiveSentiment] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isElite, setIsElite] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(DEMO_MESSAGES);
  const [chatInput, setChatInput] = useState('');
  const [userBadge, setUserBadge] = useState<'Elite' | 'Pro' | 'Free'>('Free');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/profile').then(r => r.json()).then(p => {
      setIsElite(p.is_elite ?? false);
      setIsSubscribed(p.is_subscribed ?? false);
      setUserBadge(p.is_elite ? 'Elite' : p.is_subscribed ? 'Pro' : 'Free');
      setProfileLoaded(true);
    }).catch(() => setProfileLoaded(true));
  }, []);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/events?limit=100');
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json() as { events: SignalEvent[] };
      const marketEvents = (data.events ?? []).filter(e =>
        e.company !== 'Forex Factory' && e.pairs_analysis
      );
      setEvents(marketEvents);
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
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const filteredEvents = useMemo(() => {
    let filtered = events;

    if (activePair !== 'all') {
      filtered = filtered.filter(e =>
        e.pairs_analysis?.pairs?.some((p: any) => p.pair === activePair)
      );
    }

    if (activeSentiment !== 'all') {
      filtered = filtered.filter(e => {
        if (activeSentiment === 'bullish') return e.sentiment === 'positive';
        if (activeSentiment === 'bearish') return e.sentiment === 'negative';
        return e.sentiment === 'neutral';
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(e =>
        e.title?.toLowerCase().includes(q) ||
        e.company?.toLowerCase().includes(q) ||
        e.summary?.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [events, activePair, activeSentiment, searchQuery]);

  const eliteSignals = filteredEvents.filter(e => e.trade_prediction);
  const marketSignals = filteredEvents.filter(e => !e.trade_prediction);

  function sendChat() {
    if (!chatInput.trim()) return;
    if (userBadge === 'Free') return;
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      user: 'You',
      message: chatInput,
      timestamp: new Date(),
      badge: userBadge,
    };
    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-neutral-950 p-6 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">Traders Circle</p>
            <h1 className="mt-2 text-2xl font-semibold">Market-moving signals + community.</h1>
            <p className="mt-1 text-sm text-white/60">Only signals that affect real markets. Trade setups, pair analysis and community discussion.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-white/50">{filteredEvents.length} market signals live</span>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by company, keyword or pair..."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs">✕</button>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs text-white/40 self-center">Pair:</span>
              {PAIRS_FILTER.map(pair => (
                <button key={pair} onClick={() => setActivePair(pair)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${activePair === pair ? 'bg-white text-neutral-900' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                  {pair}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs text-white/40 self-center">Bias:</span>
              {SENTIMENT_FILTER.map(s => (
                <button key={s} onClick={() => setActiveSentiment(s)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors capitalize ${activeSentiment === s
                    ? s === 'bullish' ? 'bg-emerald-500 text-white'
                    : s === 'bearish' ? 'bg-rose-500 text-white'
                    : 'bg-white text-neutral-900'
                    : 'bg-white/10 text-white hover:bg-white/20'}`}>
                  {s === 'bullish' ? '▲ Bullish' : s === 'bearish' ? '▼ Bearish' : s === 'neutral' ? '— Neutral' : 'All'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {eliteSignals.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wide text-amber-400">⭐ Elite trade setups</span>
                <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-xs text-amber-400">{eliteSignals.length}</span>
              </div>
              {eliteSignals.map(event => (
                <SignalCard key={event.id} event={event} isElite={isElite} isSubscribed={isSubscribed} />
              ))}
            </div>
          )}

          {marketSignals.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wide text-white/50">Market signals</span>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/50">{marketSignals.length}</span>
              </div>
              {marketSignals.map(event => (
                <SignalCard key={event.id} event={event} isElite={isElite} isSubscribed={isSubscribed} />
              ))}
            </div>
          )}

          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4 animate-pulse">
                  <div className="h-4 w-1/2 bg-white/10 rounded mb-3" />
                  <div className="h-5 w-3/4 bg-white/10 rounded mb-2" />
                  <div className="h-4 w-full bg-white/10 rounded" />
                </div>
              ))}
            </div>
          )}

          {!loading && filteredEvents.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
              <div className="text-white/50 text-sm mb-2">No market signals match your filters</div>
              <button onClick={() => { setActivePair('all'); setActiveSentiment('all'); setSearchQuery(''); }}
                className="text-xs text-sky-400 hover:text-sky-300">Clear filters</button>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-neutral-950 overflow-hidden flex flex-col sticky top-6" style={{ height: '75vh' }}>
            <div className="px-4 py-3 border-b border-white/10 bg-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm font-semibold text-white">Community chat</span>
                </div>
                <div className="flex items-center gap-2">
                  <BadgePill badge={userBadge} />
                </div>
              </div>
              <p className="text-xs text-white/40 mt-1">Discuss setups, share ideas, call moves</p>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {chatMessages.map(msg => (
                <div key={msg.id} className={`${msg.user === 'You' ? 'flex flex-col items-end' : ''}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3 py-2 ${msg.user === 'You' ? 'bg-amber-400/20 border border-amber-400/20' : 'bg-white/5 border border-white/10'}`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-xs font-semibold text-white">{msg.user}</span>
                      <BadgePill badge={msg.badge} />
                      {msg.pair && <span className="rounded bg-white/10 px-1.5 py-0.5 text-xs font-mono text-white/60">{msg.pair}</span>}
                    </div>
                    <p className="text-xs text-white/80">{msg.message}</p>
                    <p className="text-xs text-white/25 mt-1">
                      {msg.timestamp.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="border-t border-white/10 p-3">
              {userBadge === 'Free' ? (
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                  <p className="text-xs text-white/50 mb-2">Pro or Elite required to chat</p>
                  <a href="/pricing" className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-neutral-900">
                    Upgrade to join
                  </a>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendChat()}
                    placeholder="Share your analysis..."
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/30"
                  />
                  <button onClick={sendChat} disabled={!chatInput.trim()}
                    className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-neutral-900 disabled:opacity-40">
                    Send
                  </button>
                </div>
              )}
              <p className="text-xs text-white/20 mt-2 text-center">Be respectful · No financial advice · SRH rules apply</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
