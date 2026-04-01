/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import TelegramTagSelector from '@/components/TelegramTagSelector';

export default async function AccountSettingsPage() {
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
  const { data: { user } } = await supabase.auth.getUser();
  let profile = null;
  if (user?.email) {
    const { data } = await supabase
      .from('profiles')
      .select('api_key, is_subscribed, stripe_customer_id, telegram_chat_id, telegram_tags')
      .eq('email', user.email)
      .single();
    profile = data;
  }
  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-neutral-950 p-8 text-white shadow-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Account settings</p>
        <h1 className="mt-3 text-3xl font-semibold">Manage billing, API keys, and push alerts.</h1>
        <p className="mt-3 text-sm text-white/70">Signed in as {user?.email ?? 'unknown user'}.</p>
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white p-5 shadow">
          <div className="text-xs uppercase tracking-wide text-neutral-500">Plan</div>
          <div className="mt-2 text-xl font-semibold text-neutral-900">
            {profile?.is_subscribed ? 'Signal Relay Hub — £45/month' : 'Free plan'}
          </div>
          <p className="mt-1 text-sm text-neutral-500">
            {profile?.is_subscribed
              ? 'Billing handled via Stripe. Manage or cancel anytime.'
              : 'Unlock Flash SEC push delivery and API access.'}
          </p>
          <a
            href="/api/stripe/checkout"
            className="mt-4 inline-flex rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            {profile?.is_subscribed ? 'Manage billing' : 'Subscribe now'}
          </a>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white p-5 shadow">
          <div className="text-xs uppercase tracking-wide text-neutral-500">API key</div>
          {profile?.api_key ? (
            <>
              <p className="mt-2 text-sm text-neutral-500">Use this bearer token for all API requests.</p>
              <div className="mt-3 rounded-2xl bg-neutral-100 p-3 font-mono text-sm text-neutral-800 break-all">
                {profile.api_key}
              </div>
            </>
          ) : (
            <p className="mt-2 text-sm text-neutral-500">
              The key is provisioned automatically once your subscription is active.
            </p>
          )}
        </div>
        <div className="rounded-3xl border border-white/10 bg-white p-5 shadow lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-wide text-neutral-500">Telegram alerts</div>
              <div className="mt-1 text-xl font-semibold text-neutral-900">Stay in sync via push</div>
            </div>
            {profile?.telegram_chat_id ? (
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                Connected
              </span>
            ) : null}
          </div>
          {profile?.telegram_chat_id ? (
            <div className="mt-4">
              <p className="text-sm text-neutral-500">Select which tags should fire Telegram alerts.</p>
              <div className="mt-4 rounded-2xl border border-neutral-200 p-3">
                <TelegramTagSelector
                  email={user?.email ?? ''}
                  initialTags={profile.telegram_tags ?? ['product', 'regulatory', 'funding', 'pricing', 'security']}
                />
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-3 text-sm text-neutral-600">
              <p>Connect Telegram to receive push alerts the second new signals land.</p>
              <ol className="list-decimal space-y-1 pl-5">
                <li>
                  Open{' '}
                  <a className="text-blue-600 hover:underline" href="https://t.me/signalrelayhub_bot" target="_blank" rel="noreferrer">
                    @signalrelayhub_bot
                  </a>
                </li>
                <li>Send it the command below.</li>
              </ol>
              <div className="rounded-2xl bg-neutral-100 p-2 font-mono text-xs text-neutral-800">/connect {user?.email}</div>
              <p className="text-xs text-neutral-400">Refresh this page after you send the command.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
