/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import type { SignalEvent } from '@/lib/types';

const PAIRS = ['XAUUSD', 'EURUSD', 'BTCUSD', 'GBPUSD', 'USOIL', 'US30', 'ETHUSD'];

type ChatMessage = {
  id: string;
  user: string;
  message: string;
  timestamp: Date;
  badge: 'Elite' | 'Pro' | 'Free';
  pair?: string;
  type?: 'message' | 'trade_idea' | 'system';
  tradeIdea?: { direction: 'LONG' | 'SHORT'; entry: string; target: string; stop: string };
};

type PairSentiment = {
  pair: string;
  bullish: number;
  bearish: number;
};

const DEMO_MESSAGES: ChatMessage[] = [
  { id: 'sys1', user: 'System', message: 'Traders Circle is live. Share setups, discuss signals, call moves.', timestamp: new Date(Date.now() - 15 * 60000), badge: 'Elite', type: 'system' },
  { id: '1', user: 'TraderJoe', message: 'XAUUSD holding 4720 support hard. Fed signal earlier was the catalyst — watching for 4750 break.', timestamp: new Date(Date.now() - 12 * 60000), badge: 'Elite', pair: 'XAUUSD' },
  { id: '2', user: 'FXHunter', message: 'EUR still under pressure after that ECB filing. Short bias intact below 1.178', timestamp: new Date(Date.now() - 8 * 60000), badge: 'Pro', pair: 'EURUSD' },
  { id: '3', user: 'ScalpMaster', message: 'GBP setup looks clean for a short — BOE signal + claimant count miss', timestamp: new Date(Date.now() - 5 * 60000), badge: 'Elite', pair: 'GBPUSD', type: 'trade_idea', tradeIdea: { direction: 'SHORT', entry: '1.3520', target: '1.3460', stop: '1.3550' } },
  { id: '4', user: 'CryptoKing', message: 'BTC holding 75k — retail sales data could be the catalyst for the next leg up', timestamp: new Date(Date.now() - 2 * 60000), badge: 'Pro', pair: 'BTCUSD' },
];

const INITIAL_SENTIMENT: PairSentiment[] = [
  { pair: 'XAUUSD', bullish: 72, bearish: 28 },
  { pair: 'EURUSD', bullish: 35, bearish: 65 },
  { pair: 'BTCUSD', bullish: 68, bearish: 32 },
  { pair: 'GBPUSD', bullish: 30, bearish: 70 },
  { pair: 'USOIL', bullish: 55, bearish: 45 },
  { pair: 'US30', bullish: 60, bearish: 40 },
];

function BadgePill({ badge }: { badge: 'Elite' | 'Pro' | 'Free' }) {
  if (badge === 'Elite') return <span className="rounded px-1.5 py-0.5 text-xs font-bold bg-amber-400/20 text-amber-400 border border-amber-400/30">⭐ E</span>;
  if (badge === 'Pro') return <span className="rounded px-1.5 py-0.5 text-xs font-bold bg-sky-400/20 text-sky-400 border border-sky-400/30">P</span>;
  return <span className="rounded px-1.5 py-0.5 text-xs bg-white/10 text-white/30">F</span>;
}

function SentimentBar({ bullish, bearish }: { bullish: number; bearish: number }) {
  return (
    <div className="flex h-1.5 rounded-full overflow-hidden w-full">
      <div className="bg-emerald-400 transition-all duration-500" style={{ width: `${bullish}%` }} />
      <div className="bg-rose-400 transition-all duration-500" style={{ width: `${bearish}%` }} />
    </div>
  );
}

function SignalCard({ event, isElite }: { event: SignalEvent; isElite: boolean }) {
  const isPositive = event.sentiment === 'positive';
  const isNegative = event.sentiment === 'negative';

  return (
    <div className={`rounded-xl border bg-neutral-900/80 p-3 text-white transition-all hover:bg-neutral-900 ${isPositive ? 'border-emerald-500/30' : isNegative ? 'border-rose-500/30' : 'border-white/10'}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-mono text-white/30">
            {event.published_at && !event.published_at.includes('1970')
              ? new Date(event.published_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
              : new Date(event.fetched_at ?? '').toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-white/70">{event.company}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {event.impact_score && (
            <span className={`text-xs font-bold ${(event.impact_score ?? 0) >= 4 ? 'text-rose-400' : 'text-amber-400'}`}>
              {'█'.repeat(Math.min(event.impact_score ?? 0, 5))}
            </span>
          )}
          <span className={`text-xs font-bold ${isPositive ? 'text-emerald-400' : isNegative ? 'text-rose-400' : 'text-white/40'}`}>
            {isPositive ? '▲' : isNegative ? '▼' : '—'}
          </span>
        </div>
      </div>

      <a href={event.source_url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-white hover:text-sky-300 leading-snug block">
        {event.title}
      </a>

      {event.pairs_analysis?.pairs && event.pairs_analysis.pairs.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {event.pairs_analysis.pairs.map((p: any) => (
            <span key={p.pair} className={`rounded px-1.5 py-0.5 text-xs font-mono font-bold ${p.direction === 'bullish' ? 'bg-emerald-500/20 text-emerald-400' : p.direction === 'bearish' ? 'bg-rose-500/20 text-rose-400' : 'bg-white/5 text-white/40'}`}>
              {p.pair} {p.direction === 'bullish' ? '▲' : p.direction === 'bearish' ? '▼' : '—'}
            </span>
          ))}
        </div>
      )}

      {event.trade_prediction && (
        <div className={`mt-2 rounded border border-amber-500/20 bg-amber-500/5 p-2 relative overflow-hidden ${!isElite ? 'blur-sm' : ''}`}>
          {event.trade_prediction.trades?.slice(0, 1).map((t: any) => (
            <div key={t.pair} className="flex items-center gap-2 text-xs">
              <span className="font-mono font-bold text-white">{t.pair}</span>
              <span className={`font-bold ${t.direction === 'long' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {t.direction === 'long' ? '▲ LONG' : '▼ SHORT'}
              </span>
              <span className="text-white/40">{t.entry_zone}</span>
              <span className="text-emerald-400">→{t.target}</span>
              <span className="text-rose-400">✕{t.stop_loss}</span>
            </div>
          ))}
        </div>
      )}
      {event.trade_prediction && !isElite && (
        <a href="/pricing" className="mt-1 block text-xs text-amber-400 hover:text-amber-300">⭐ Upgrade to Elite to see setup →</a>
      )}
    </div>
  );
}

export default function TraderCirclePage() {
  const [events, setEvents] = useState<SignalEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [activePair, setActivePair] = useState('all');
  const [isElite, setIsElite] = useState(false);
  const [userBadge, setUserBadge] = useState<'Elite' | 'Pro' | 'Free'>('Free');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(DEMO_MESSAGES);
  const [chatInput, setChatInput] = useState('');
  const [sentiment, setSentiment] = useState<PairSentiment[]>(INITIAL_SENTIMENT);
  const [votedPairs, setVotedPairs] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'signals' | 'ideas' | 'chat'>('signals');
  const [showTradeForm, setShowTradeForm] = useState(false);
  const [tradeForm, setTradeForm] = useState({ pair: 'XAUUSD', direction: 'LONG', entry: '', target: '', stop: '', thesis: '' });
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/profile').then(r => r.json()).then(p => {
      setIsElite(p.is_elite ?? false);
      setUserBadge(p.is_elite ? 'Elite' : p.is_subscribed ? 'Pro' : 'Free');
    }).catch(() => {});
  }, []);

 const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/events?limit=200');
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json() as { events: SignalEvent[] };

      // Filter to only genuinely market-moving signals
      const marketEvents = (data.events ?? []).filter((e: SignalEvent) => {
        if (e.company === 'Forex Factory') return false;
        if (!e.pairs_analysis) return false;

        // Filter out signals where ALL pairs are neutral — no real market impact
        const pairs = e.pairs_analysis?.pairs ?? [];
        const hasDirectionalPair = pairs.some((p: any) => p.direction === 'bullish' || p.direction === 'bearish');
        if (!hasDirectionalPair) return false;

        // Filter out low value SEC form types
        const lowValueForms = ['497k', '497', 'n-14', 'n-2', 'n-csr', 's-11', 'ars', 'defa14a', 'def 14a'];
        const titleLower = (e.title ?? '').toLowerCase();
        if (lowValueForms.some(f => titleLower.includes(f))) return false;

        // Must have impact score of at least 2
        if ((e.impact_score ?? 0) < 2) return false;

        return true;
      });

      // Deduplicate by company — only show the highest impact signal per company per session
      const seen = new Map<string, SignalEvent>();
      for (const event of marketEvents) {
        const key = event.company;
        const existing = seen.get(key);
        if (!existing || (event.impact_score ?? 0) > (existing.impact_score ?? 0)) {
          seen.set(key, event);
        }
      }

      setEvents(Array.from(seen.values()));
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadEvents(); }, [loadEvents]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  const filteredEvents = useMemo(() => {
    if (activePair === 'all') return events;
    return events.filter(e => e.pairs_analysis?.pairs?.some((p: any) => p.pair === activePair));
  }, [events, activePair]);

  const eliteSignals = filteredEvents.filter(e => e.trade_prediction);
  const marketSignals = filteredEvents.filter(e => !e.trade_prediction);

  function vote(pair: string, direction: 'bullish' | 'bearish') {
    if (votedPairs.has(pair)) return;
   setVotedPairs(prev => { const next = new Set(prev); next.add(pair); return next; });
    setSentiment(prev => prev.map(s => {
      if (s.pair !== pair) return s;
      const total = s.bullish + s.bearish + 1;
      const newBull = direction === 'bullish' ? s.bullish + 1 : s.bullish;
      const newBear = direction === 'bearish' ? s.bearish + 1 : s.bearish;
      return { pair, bullish: Math.round((newBull / total) * 100), bearish: Math.round((newBear / total) * 100) };
    }));
  }

  function sendChat() {
    if (!chatInput.trim() || userBadge === 'Free') return;
    setChatMessages(prev => [...prev, {
      id: Date.now().toString(),
      user: 'You',
      message: chatInput,
      timestamp: new Date(),
      badge: userBadge,
      type: 'message',
    }]);
    setChatInput('');
  }

  function submitTradeIdea() {
    if (!tradeForm.entry || !tradeForm.target || !tradeForm.stop || userBadge === 'Free') return;
    setChatMessages(prev => [...prev, {
      id: Date.now().toString(),
      user: 'You',
      message: tradeForm.thesis || `${tradeForm.pair} ${tradeForm.direction} setup`,
      timestamp: new Date(),
      badge: userBadge,
      pair: tradeForm.pair,
      type: 'trade_idea',
      tradeIdea: { direction: tradeForm.direction as 'LONG' | 'SHORT', entry: tradeForm.entry, target: tradeForm.target, stop: tradeForm.stop },
    }]);
    setShowTradeForm(false);
    setTradeForm({ pair: 'XAUUSD', direction: 'LONG', entry: '', target: '', stop: '', thesis: '' });
    setActiveTab('chat');
  }

  const pairSentimentData = sentiment.find(s => s.pair === activePair);

  return (
    <div className="min-h-screen text-white">
      <div className="border-b border-white/10 bg-neutral-950/80 backdrop-blur sticky top-0 z-30 px-0">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-white">Traders Circle</span>
              </div>
              <div className="text-xs text-white/40 mt-0.5">{filteredEvents.length} market signals · community live</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BadgePill badge={userBadge} />
            {userBadge !== 'Free' && (
              <button onClick={() => { setShowTradeForm(true); setActiveTab('ideas'); }}
                className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-bold text-amber-400 hover:bg-amber-400/20 transition-colors">
                + Post idea
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-1 px-4 pb-2">
            <button onClick={() => setActivePair('all')}
              className={`rounded-lg px-3 py-1.5 text-xs font-mono font-bold whitespace-nowrap transition-colors ${activePair === 'all' ? 'bg-white text-neutral-900' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
              ALL
            </button>
            {PAIRS.map(pair => {
              const s = sentiment.find(x => x.pair === pair);
              const bias = s ? (s.bullish > s.bearish ? 'bull' : 'bear') : null;
              return (
                <button key={pair} onClick={() => setActivePair(pair)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-mono font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${activePair === pair ? 'bg-white text-neutral-900' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
                  {pair}
                  {bias && <span className={bias === 'bull' ? 'text-emerald-400' : 'text-rose-400'}>{bias === 'bull' ? '▲' : '▼'}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-0 min-h-[calc(100vh-120px)]">
        <div className="border-r border-white/10">
          <div className="flex border-b border-white/10">
            {(['signals', 'ideas', 'chat'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wide transition-colors ${activeTab === tab ? 'border-b-2 border-white text-white' : 'text-white/30 hover:text-white/60'}`}>
                {tab === 'signals' ? `Signals ${filteredEvents.length > 0 ? `(${filteredEvents.length})` : ''}` : tab === 'ideas' ? 'Trade Ideas' : 'Discussion'}
              </button>
            ))}
          </div>

          <div className="overflow-y-auto" style={{ height: 'calc(100vh - 200px)' }}>
            {activeTab === 'signals' && (
              <div className="p-3 space-y-2">
                {eliteSignals.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 px-1 py-1">
                      <span className="text-xs font-mono text-amber-400 uppercase tracking-widest">⭐ Elite setups</span>
                      <div className="flex-1 h-px bg-amber-400/20" />
                      <span className="text-xs text-amber-400/60">{eliteSignals.length}</span>
                    </div>
                    {eliteSignals.map(event => <SignalCard key={event.id} event={event} isElite={isElite} />)}
                  </div>
                )}
                {marketSignals.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 px-1 py-1">
                      <span className="text-xs font-mono text-white/40 uppercase tracking-widest">Market signals</span>
                      <div className="flex-1 h-px bg-white/10" />
                      <span className="text-xs text-white/30">{marketSignals.length}</span>
                    </div>
                    {marketSignals.map(event => <SignalCard key={event.id} event={event} isElite={isElite} />)}
                  </div>
                )}
                {loading && [1,2,3].map(i => (
                  <div key={i} className="rounded-xl border border-white/10 bg-neutral-900/80 p-3 animate-pulse">
                    <div className="h-3 w-1/3 bg-white/10 rounded mb-2" />
                    <div className="h-4 w-3/4 bg-white/10 rounded" />
                  </div>
                ))}
                {!loading && filteredEvents.length === 0 && (
                  <div className="p-8 text-center text-white/30 text-sm">No market signals for {activePair === 'all' ? 'any pair' : activePair} yet</div>
                )}
              </div>
            )}

            {activeTab === 'ideas' && (
              <div className="p-3 space-y-3">
                {showTradeForm && userBadge !== 'Free' && (
                  <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 space-y-3">
                    <div className="text-xs font-bold text-amber-400 uppercase tracking-wide">Post a trade idea</div>
                    <div className="grid grid-cols-2 gap-2">
                      <select value={tradeForm.pair} onChange={e => setTradeForm(p => ({...p, pair: e.target.value}))}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:outline-none">
                        {PAIRS.map(p => <option key={p} value={p} className="bg-neutral-900">{p}</option>)}
                      </select>
                      <select value={tradeForm.direction} onChange={e => setTradeForm(p => ({...p, direction: e.target.value}))}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:outline-none">
                        <option value="LONG" className="bg-neutral-900">▲ LONG</option>
                        <option value="SHORT" className="bg-neutral-900">▼ SHORT</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {(['entry', 'target', 'stop'] as const).map(field => (
                        <input key={field} type="text" placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                          value={tradeForm[field]} onChange={e => setTradeForm(p => ({...p, [field]: e.target.value}))}
                          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none font-mono" />
                      ))}
                    </div>
                    <input type="text" placeholder="Thesis (optional)" value={tradeForm.thesis}
                      onChange={e => setTradeForm(p => ({...p, thesis: e.target.value}))}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none" />
                    <div className="flex gap-2">
                      <button onClick={submitTradeIdea} className="flex-1 rounded-lg bg-amber-400 py-2 text-xs font-bold text-neutral-900">Post idea</button>
                      <button onClick={() => setShowTradeForm(false)} className="rounded-lg border border-white/10 px-4 py-2 text-xs text-white/50">Cancel</button>
                    </div>
                  </div>
                )}
                {chatMessages.filter(m => m.type === 'trade_idea').map(msg => (
                  <div key={msg.id} className={`rounded-xl border p-3 ${msg.tradeIdea?.direction === 'LONG' ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-rose-500/20 bg-rose-500/5'}`}>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <BadgePill badge={msg.badge} />
                        <span className="text-xs font-semibold text-white">{msg.user}</span>
                        {msg.pair && <span className="rounded bg-white/10 px-1.5 py-0.5 text-xs font-mono text-white/60">{msg.pair}</span>}
                      </div>
                      <span className="text-xs text-white/25">{msg.timestamp.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    {msg.tradeIdea && (
                      <div className="flex items-center gap-3 text-xs font-mono">
                        <span className={`font-bold text-sm ${msg.tradeIdea.direction === 'LONG' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {msg.tradeIdea.direction === 'LONG' ? '▲' : '▼'} {msg.tradeIdea.direction}
                        </span>
                        <span className="text-white/40">Entry <span className="text-white">{msg.tradeIdea.entry}</span></span>
                        <span className="text-white/40">TP <span className="text-emerald-400">{msg.tradeIdea.target}</span></span>
                        <span className="text-white/40">SL <span className="text-rose-400">{msg.tradeIdea.stop}</span></span>
                      </div>
                    )}
                    {msg.message && <p className="text-xs text-white/60 mt-1">{msg.message}</p>}
                  </div>
                ))}
                {chatMessages.filter(m => m.type === 'trade_idea').length === 0 && !showTradeForm && (
                  <div className="p-8 text-center">
                    <div className="text-white/30 text-sm mb-3">No trade ideas posted yet</div>
                    {userBadge !== 'Free' ? (
                      <button onClick={() => setShowTradeForm(true)} className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-xs font-bold text-amber-400">
                        Post the first idea
                      </button>
                    ) : (
                      <a href="/pricing" className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/50">
                        Upgrade to post ideas
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {chatMessages.map(msg => (
                    <div key={msg.id}>
                      {msg.type === 'system' ? (
                        <div className="text-center py-2">
                          <span className="text-xs text-white/20 font-mono">{msg.message}</span>
                        </div>
                      ) : (
                        <div className={`flex gap-2 ${msg.user === 'You' ? 'flex-row-reverse' : ''}`}>
                          <div className={`max-w-[80%] rounded-xl px-3 py-2 ${msg.user === 'You' ? 'bg-amber-400/15 border border-amber-400/20' : 'bg-white/5 border border-white/10'}`}>
                            <div className="flex items-center gap-1.5 mb-1">
                              <BadgePill badge={msg.badge} />
                              <span className="text-xs font-semibold text-white">{msg.user}</span>
                              {msg.pair && <span className="rounded bg-white/10 px-1 py-0.5 text-xs font-mono text-white/40">{msg.pair}</span>}
                              <span className="text-xs text-white/20">{msg.timestamp.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="text-xs text-white/80 leading-relaxed">{msg.message}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <div className="border-t border-white/10 p-3">
                  {userBadge === 'Free' ? (
                    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                      <span className="text-xs text-white/30">Pro or Elite to chat</span>
                      <a href="/pricing" className="text-xs text-sky-400 hover:text-sky-300">Upgrade →</a>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && sendChat()}
                        placeholder="Share your analysis..."
                        className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-white/30" />
                      <button onClick={sendChat} disabled={!chatInput.trim()}
                        className="rounded-lg bg-white px-3 text-xs font-bold text-neutral-900 disabled:opacity-30">↑</button>
                    </div>
                  )}
                  <p className="text-xs text-white/15 mt-1.5 text-center">No financial advice · SRH community rules apply</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <aside className="hidden lg:flex flex-col border-l border-white/10 bg-neutral-950/50">
          <div className="p-4 border-b border-white/10">
            <div className="text-xs font-mono uppercase tracking-widest text-white/40 mb-3">Community sentiment</div>
            <div className="space-y-3">
              {sentiment.map(s => {
                const voted = votedPairs.has(s.pair);
                const isActive = activePair === s.pair || activePair === 'all';
                return (
                  <div key={s.pair} className={`transition-opacity ${isActive ? 'opacity-100' : 'opacity-30'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-white">{s.pair}</span>
                        <span className={`text-xs font-bold ${s.bullish > s.bearish ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {s.bullish > s.bearish ? `▲ ${s.bullish}%` : `▼ ${s.bearish}%`}
                        </span>
                      </div>
                      {!voted ? (
                        <div className="flex gap-1">
                          <button onClick={() => vote(s.pair, 'bullish')} className="rounded px-1.5 py-0.5 text-xs bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors">▲</button>
                          <button onClick={() => vote(s.pair, 'bearish')} className="rounded px-1.5 py-0.5 text-xs bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-colors">▼</button>
                        </div>
                      ) : (
                        <span className="text-xs text-white/20">voted</span>
                      )}
                    </div>
                    <SentimentBar bullish={s.bullish} bearish={s.bearish} />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 border-b border-white/10">
            <div className="text-xs font-mono uppercase tracking-widest text-white/40 mb-3">Pair focus</div>
            {pairSentimentData && activePair !== 'all' ? (
              <div className="space-y-2">
                <div className="text-2xl font-mono font-bold text-white">{activePair}</div>
                <div className="flex items-center gap-3">
                  <div className="text-emerald-400 text-sm font-bold">{pairSentimentData.bullish}% bull</div>
                  <div className="text-rose-400 text-sm font-bold">{pairSentimentData.bearish}% bear</div>
                </div>
                <SentimentBar bullish={pairSentimentData.bullish} bearish={pairSentimentData.bearish} />
                <div className="text-xs text-white/30 mt-2">
                  {filteredEvents.filter(e => e.sentiment === 'positive').length} bullish signals ·{' '}
                  {filteredEvents.filter(e => e.sentiment === 'negative').length} bearish signals
                </div>
              </div>
            ) : (
              <div className="text-xs text-white/30">Select a pair to see detailed stats</div>
            )}
          </div>

          <div className="p-4 flex-1">
            <div className="text-xs font-mono uppercase tracking-widest text-white/40 mb-3">Membership perks</div>
            <div className="space-y-2">
              <div className={`rounded-lg border p-2.5 ${userBadge === 'Elite' ? 'border-amber-400/30 bg-amber-400/5' : 'border-white/5 bg-white/3 opacity-40'}`}>
                <div className="text-xs font-bold text-amber-400 mb-1">⭐ Elite</div>
                <div className="text-xs text-white/50 space-y-0.5">
                  <div>· AI trade predictions on every signal</div>
                  <div>· Daily AI briefing at 7am</div>
                  <div>· Pre-event alerts 15min before news</div>
                  <div>· AI Trading Assistant</div>
                  <div>· Elite badge in Traders Circle</div>
                </div>
              </div>
              <div className={`rounded-lg border p-2.5 ${userBadge === 'Pro' || userBadge === 'Elite' ? 'border-sky-400/30 bg-sky-400/5' : 'border-white/5 bg-white/3 opacity-40'}`}>
                <div className="text-xs font-bold text-sky-400 mb-1">Pro</div>
                <div className="text-xs text-white/50 space-y-0.5">
                  <div>· Full signal feed unlimited</div>
                  <div>· Telegram push alerts</div>
                  <div>· Flash SEC filings</div>
                  <div>· Chat + trade ideas in Traders Circle</div>
                  <div>· API key access</div>
                </div>
              </div>
              {userBadge === 'Free' && (
                <a href="/pricing" className="block rounded-lg bg-white py-2 text-center text-xs font-bold text-neutral-900 hover:bg-white/90 transition-colors mt-3">
                  Upgrade now
                </a>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
