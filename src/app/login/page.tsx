'use client';

import { useMemo, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  async function sendMagicLink() {
    if (!supabase || !email) return;
    setStatus(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setStatus(error.message);
    else setStatus('Magic link sent — check your inbox.');
  }

  return (
    <div className="relative min-h-screen bg-neutral-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_55%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col gap-12 px-6 py-12 lg:flex-row lg:items-center">
        <section className="lg:w-1/2">
          <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-wide text-white/70">
            Secure by design
          </span>
          <h1 className="mt-5 text-4xl font-semibold leading-tight">Magic links for Signal Relay Hub.</h1>
          <p className="mt-4 text-sm text-white/70">
            We authenticate with Supabase magic links so you can keep your stack passwordless. The
            link redirects through <span className="font-mono">/auth/callback</span> to set cookies and hand you
            straight back to the feed.
          </p>
          <div className="mt-8 grid gap-4 text-sm text-white/80 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-wide text-emerald-200">Ops ready</div>
              <p className="mt-2">One click to re-issue a link for teammates on the ops desk.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-wide text-sky-200">Zero passwords</div>
              <p className="mt-2">Links expire fast, so there’s nothing sensitive to store.</p>
            </div>
          </div>
        </section>

        <section className="lg:w-1/2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
            <h2 className="text-lg font-semibold">Send a magic link</h2>
            <p className="mt-1 text-sm text-white/70">Use your work email and we’ll handle the rest.</p>

            {!supabase ? (
              <div className="mt-6 rounded-2xl border border-rose-300/40 bg-rose-500/10 p-4 text-sm text-rose-50">
                Missing env vars:
                <div className="mt-2 font-mono text-xs">
                  NEXT_PUBLIC_SUPABASE_URL
                  <br />
                  NEXT_PUBLIC_SUPABASE_ANON_KEY
                </div>
                <div className="mt-3 text-xs text-rose-100/70">
                  Add them to <span className="font-mono">.env.local</span> to enable Supabase auth locally.
                </div>
              </div>
            ) : (
              <>
                <label className="mt-6 block text-xs font-medium uppercase tracking-wide text-white/70">
                  Work email
                </label>
                <input
                  className="mt-2 w-full rounded-2xl border border-white/20 bg-black/40 px-4 py-3 text-base text-white placeholder:text-white/40 focus:border-white/60 focus:outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="you@domain.com"
                />
                <button
                  className="mt-4 w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={sendMagicLink}
                  disabled={!email}
                >
                  Send magic link
                </button>

                {status ? (
                  <div className="mt-4 rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white/80">
                    {status}
                  </div>
                ) : null}

                <div className="mt-6 text-xs text-white/60">
                  We only use your email to verify access and set session cookies. Links expire in a
                  few minutes; if it lapses, just re-send a new one.
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
