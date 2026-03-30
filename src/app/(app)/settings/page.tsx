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
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user?.email) {
    const { data } = await supabase
      .from('profiles')
      .select('api_key, is_subscribed, stripe_customer_id')
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
          <a
            href="/api/stripe/checkout"
            className="mt-3 inline-flex rounded-md bg-black px-3 py-2 text-sm text-white hover:bg-black/90"
          >
            {profile?.is_subscribed ? 'Manage billing' : 'Subscribe now'}
          </a>
        </div>
        <div className="rounded-md border p-4">
          <div className="font-medium">API Key</div>
          {profile?.api_key ? (
            <>
              <div className="mt-1 text-sm text-neutral-600">
                Use this key to authenticate API requests.
              </div>
              <div className="mt-3 rounded bg-neutral-100 p-2 font-mono text-xs text-neutral-700 break-all">
                {profile.api_key}
              </div>
            </>
          ) : (
            <div className="mt-1 text-sm text-neutral-600">
              Provisioned automatically after subscribing.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
