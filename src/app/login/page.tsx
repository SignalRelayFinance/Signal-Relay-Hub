'use client';

import { useMemo, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  async function sendMagicLink() {
    if (!supabase) return;
    setStatus(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setStatus(error.message);
    else setStatus('Magic link sent. Check your email.');
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="text-2xl font-semibold">Login</h1>
      <p className="mt-2 text-sm text-neutral-600">Email magic link for MVP.</p>

      {!supabase ? (
        <div className="mt-6 rounded-md border p-4 text-sm text-neutral-700">
          Missing env vars:
          <div className="mt-2 font-mono text-xs">
            NEXT_PUBLIC_SUPABASE_URL
            <br />
            NEXT_PUBLIC_SUPABASE_ANON_KEY
          </div>
          <div className="mt-3 text-xs text-neutral-500">
            Add them to <span className="font-mono">.env.local</span>.
          </div>
        </div>
      ) : (
        <>
          <label className="mt-6 text-sm font-medium">Email</label>
          <input
            className="mt-2 rounded-md border px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@domain.com"
          />
          <button
            className="mt-4 rounded-md bg-black px-4 py-2 text-white hover:bg-black/90 disabled:opacity-50"
            onClick={sendMagicLink}
            disabled={!email}
          >
            Send magic link
          </button>

          {status ? <div className="mt-4 text-sm">{status}</div> : null}

          <div className="mt-8 text-xs text-neutral-500">
            Magic links redirect through <span className="font-mono">/auth/callback</span> to set
            cookies.
          </div>
        </>
      )}
    </div>
  );
}
