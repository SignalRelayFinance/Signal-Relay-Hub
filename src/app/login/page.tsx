'use client';

import { useMemo, useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

const LIVE_SIGNALS = [
  { pair: 'XAUUSD', direction: 'LONG', change: '+1.2%', time: '2m ago' },
  { pair: 'EURUSD', direction: 'SHORT', change: '-0.4%', time: '5m ago' },
  { pair: 'BTCUSD', direction: 'LONG', change: '+2.8%', time: '8m ago' },
  { pair: 'GBPUSD', direction: 'SHORT', change: '-0.6%', time: '12m ago' },
  { pair: 'USOIL', direction: 'LONG', change: '+0.9%', time: '15m ago' },
  { pair: 'US30', direction: 'LONG', change: '+0.3%', time: '18m ago' },
];

const STATS = [
  { label: 'Live sources', value: '28+' },
  { label: 'Daily signals', value: '200+' },
  { label: 'Alert speed', value: '<4 min' },
];

function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(59,130,246,0.12),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(245,158,11,0.06),transparent_50%)]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}

function SignalTicker() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setOffset(prev => (prev + 1) % LIVE_SIGNALS.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const visible = [...LIVE_SIGNALS, ...LIVE_SIGNALS].slice(offset, offset + 3);

  return (
    <div className="space-y-2">
      {visible.map((signal, i) => (
        <div
          key={`${signal.pair}-${offset}-${i}`}
          className={`flex items-center justify-between rounded-lg border px-3 py-2 transition-all duration-500 ${
            signal.direction === 'LONG'
              ? 'border-emerald-500/20 bg-emerald-500/5'
              : 'border-rose-500/20 bg-rose-500/5'
          } ${i === 0 ? 'opacity-100' : i === 1 ? 'opacity-70' : 'opacity-40'}`}
        >
          <div className="flex items-center gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${signal.direction === 'LONG' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
            <span className="font-mono text-xs font-bold text-white">{signal.pair}</span>
            <span className={`rounded px-1.5 py-0.5 text-xs font-bold ${signal.direction === 'LONG' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
              {signal.direction === 'LONG' ? '▲' : '▼'} {signal.direction}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold ${signal.direction === 'LONG' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {signal.change}
            </span>
            <span className="text-xs text-white/25 font-mono">{signal.time}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function LoginPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  async function sendMagicLink() {
    if (!supabase || !email) return;
    setLoading(true);
    setErrorMsg('');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (error) { setStatus('error'); setErrorMsg(error.message); }
    else setStatus('sent');
  }

  return (
    <div className="relative min-h-screen bg-neutral-950 text-white overflow-hidden">
      <GridBackground />

      <div className="relative flex min-h-screen">
        {/* Left panel */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 border-r border-white/5">
          <div>
            <div className="flex items-center gap-2 mb-12">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-widest text-white/50">Signal Relay Hub</span>
            </div>

            <div className="mb-8">
              <div className="text-xs font-mono uppercase tracking-widest text-white/30 mb-3">Live signals</div>
              <SignalTicker />
            </div>

            <div className="grid grid-cols-3 gap-3 mb-8">
              {STATS.map(stat => (
                <div key={stat.label} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <div className="font-mono text-lg font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-white/30 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 h-6 w-6 rounded-full bg-amber-400/20 flex items-center justify-center shrink-0">
                  <span className="text-xs text-amber-400">⭐</span>
                </div>
                <div>
                  <div className="text-xs font-semibold text-white mb-1">Elite members get more</div>
                  <div className="text-xs text-white/40 leading-relaxed">
                    AI trade predictions · Daily briefing · Pre-event alerts · AI Trading Assistant · Weekly macro outlook
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-white/20 font-mono">
            © 2026 Signal Relay Hub · signalrelayhub.io
          </div>
        </div>

        {/* Right panel — login form */}
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">
            <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-widest text-white/50">Signal Relay Hub</span>
            </div>

            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-white mb-2">Welcome back</h1>
              <p className="text-sm text-white/40">Enter your email to receive a secure sign-in link.</p>
            </div>

            {status === 'sent' ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                  <span className="text-emerald-400 text-xl">✓</span>
                </div>
                <div className="text-sm font-semibold text-white mb-2">Check your inbox</div>
                <div className="text-xs text-white/40 mb-6">
                  We sent a magic link to <span className="text-white/70 font-mono">{email}</span>
                </div>
                <button
                  onClick={() => { setStatus('idle'); setEmail(''); }}
                  className="text-xs text-white/40 hover:text-white/60 transition-colors"
                >
                  Use a different email
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-white/30 mb-2">
                      Email address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && sendMagicLink()}
                      placeholder="you@domain.com"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors font-mono"
                    />
                  </div>

                  <button
                    onClick={sendMagicLink}
                    disabled={!email || loading}
                    className="w-full rounded-xl bg-white py-3 text-sm font-semibold text-neutral-900 hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-3 w-3 rounded-full border-2 border-neutral-400 border-t-neutral-900 animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      'Send magic link →'
                    )}
                  </button>
                </div>

                {status === 'error' && (
                  <div className="mt-3 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs text-rose-300">
                    {errorMsg}
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-white/5">
                  <div className="text-xs text-white/25 text-center leading-relaxed">
                    No password required · Link expires after use · Secured by Supabase
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <span className="text-xs text-white/25">Don't have an account? </span>
                  <a href="/pricing" className="text-xs text-white/50 hover:text-white transition-colors">
                    View pricing →
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
