/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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
    <div>
      <h1 className="text-2xl font-semibold">Account Settings</h1>
      <div className="mt-2 text-sm text-neutral-500">{user?.email}</div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">

        <div className="rounded-md border p-4">
          <div className="font-medium">Plan</div>
          <div className="mt-1 text-sm text-neutral-600">
            {profile?.is_subscribed ? 'Signal Relay Hub — £45/month' : 'Free (no active subscription)'}
          </div>
          <a href="/api/stripe/checkout" className="mt-3 inline-flex rounded-md bg-black px-3 py-2 text-sm text-white hover:bg-black/90">
            {profile?.is_subscribed ? 'Manage billing' : 'Subscribe now'}
          </a>
        </div>

        <div className="rounded-md border p-4">
          <div className="font-medium">API Key</div>
          {profile?.api_key ? (
            <>
              <div className="mt-1 text-sm text-neutral-600">Use this key to authenticate API requests.</div>
              <div className="mt-3 rounded bg-neutral-100 p-2 font-mono text-xs text-neutral-700 break-all">{profile.api_key}</div>
            </>
          ) : (
            <div className="mt-1 text-sm text-neutral-600">Provisioned automatically after subscribing.</div>
          )}
        </div>

        <div className="rounded-md border p-4 sm:col-span-2">
          <div className="font-medium">Telegram Alerts</div>
          {profile?.telegram_chat_id ? (
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">Connected</span>
              <span className="text-sm text-neutral-500">You will receive signal alerts via Telegram.</span>
            </div>
          ) : (
            <div className="mt-2 space-y-2">
              <div className="text-sm text-neutral-600">Connect your Telegram to receive push alerts when new signals drop.</div>
              <ol className="mt-3 space-y-1 text-sm text-neutral-600 list-decimal list-inside">
                <li>Open Telegram and <a href="https://t.me/signalrelayhub_bot" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">click here to open the bot</a></li>
                <li>Send it this message:</li>
              </ol>
              <div className="mt-2 rounded bg-neutral-100 p-2 font-mono text-xs text-neutral-700">/connect {user?.email}</div>
              <div className="text-xs text-neutral-400 mt-1">Then refresh this page to confirm connection.</div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
