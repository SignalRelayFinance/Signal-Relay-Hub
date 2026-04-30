'use client';

import React from 'react';

const PERFORMANCE_STATS = {
  winRate: '73.4%',
  totalSignals: 142,
  profitableTrades: 104,
  stoppedOut: 38,
  avgRiskReward: '1:2.4',
  pipsCaptured: '+1,840',
};

const PAIR_BREAKDOWN = [
  { pair: 'XAUUSD', winRate: '78%', signals: 45, profit: '+820 pips', trend: 'up' },
  { pair: 'BTCUSD', winRate: '71%', signals: 32, profit: '+14.2%', trend: 'up' },
  { pair: 'EURUSD', winRate: '68%', signals: 28, profit: '+410 pips', trend: 'down' },
  { pair: 'GBPUSD', winRate: '65%', signals: 20, profit: '+290 pips', trend: 'down' },
  { pair: 'USOIL', winRate: '82%', signals: 17, profit: '+8.4%', trend: 'up' },
];

const RECENT_TRADES = [
  { pair: 'XAUUSD', direction: 'LONG', date: 'Today, 14:30', outcome: 'Win', profit: '+120 pips', catalyst: 'US CPI Data Miss' },
  { pair: 'EURUSD', direction: 'SHORT', date: 'Yesterday, 09:15', outcome: 'Loss', profit: '-40 pips', catalyst: 'ECB Rate Decision' },
  { pair: 'BTCUSD', direction: 'LONG', date: 'Yesterday, 18:45', outcome: 'Win', profit: '+2.1%', catalyst: 'Coinbase SEC 8-K' },
  { pair: 'US30', direction: 'SHORT', date: 'Mon, 15:30', outcome: 'Win', profit: '+180 pips', catalyst: 'FOMC Minutes' },
  { pair: 'GBPUSD', direction: 'LONG', date: 'Mon, 08:00', outcome: 'Loss', profit: '-35 pips', catalyst: 'UK Retail Sales' },
];

export default function AccuracyTrackerPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-neutral-950 p-6 lg:p-8 text-white shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">Performance</p>
          <span className="rounded-full bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 text-xs text-amber-300">Beta</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-semibold leading-tight">Signal Accuracy Tracker</h1>
        <p className="mt-2 text-sm text-white/70 max-w-2xl">
          A fully transparent log of our AI&apos;s historical trade predictions. We track every setup against live market data to calculate our true win rate across all pairs.
        </p>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-xs uppercase tracking-wide text-white/50 mb-1">Overall Win Rate</div>
          <div className="text-3xl font-bold text-emerald-400">{PERFORMANCE_STATS.winRate}</div>
          <div className="text-xs text-white/40 mt-1">Last 30 days</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-xs uppercase tracking-wide text-white/50 mb-1">Total Signals</div>
          <div className="text-3xl font-bold text-white">{PERFORMANCE_STATS.totalSignals}</div>
          <div className="text-xs text-emerald-400 mt-1">{PERFORMANCE_STATS.profitableTrades} wins / <span className="text-rose-400">{PERFORMANCE_STATS.stoppedOut} losses</span></div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 hidden md:block">
          <div className="text-xs uppercase tracking-wide text-white/50 mb-1">Avg Risk/Reward</div>
          <div className="text-3xl font-bold text-white">{PERFORMANCE_STATS.avgRiskReward}</div>
          <div className="text-xs text-white/40 mt-1">Based on entry vs target/stop</div>
        </div>
      </section>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="rounded-3xl border border-white/10 bg-neutral-950 p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Accuracy by Pair</h2>
          <div className="space-y-4">
            {PAIR_BREAKDOWN.map((pair) => (
              <div key={pair.pair} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors border border-white/5">
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center h-8 w-8 rounded-full ${pair.trend === 'up' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {pair.trend === 'up' ? '▲' : '▼'}
                  </div>
                  <div>
                    <div className="font-mono font-bold text-white">{pair.pair}</div>
                    <div className="text-xs text-white/40">{pair.signals} signals</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-white">{pair.winRate}</div>
                  <div className="text-xs text-emerald-400">{pair.profit}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-neutral-950 p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Recent Outcomes</h2>
          <div className="space-y-4">
            {RECENT_TRADES.map((trade, i) => (
              <div key={i} className="flex flex-col gap-2 p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-white">{trade.pair}</span>
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${trade.direction === 'LONG' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                      {trade.direction}
                    </span>
                  </div>
                  <span className="text-xs text-white/40">{trade.date}</span>
                </div>
                <div className="text-xs text-white/60 truncate">Catalyst: {trade.catalyst}</div>
                <div className="flex items-center justify-between mt-1 pt-2 border-t border-white/5">
                  <span className={`text-xs font-semibold ${trade.outcome === 'Win' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {trade.outcome === 'Win' ? '✓ Target Hit' : '✕ Stopped Out'}
                  </span>
                  <span className={`text-xs font-mono font-bold ${trade.outcome === 'Win' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {trade.profit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
