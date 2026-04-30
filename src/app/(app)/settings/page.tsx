/* eslint-disable @typescript-eslint/no-explicit-any, react/no-unescaped-entities */
'use client';

import React, { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import TelegramTagSelector from '@/components/TelegramTagSelector';

export default function AccountSettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
        const { data } = await supabase
          .from('profiles')
          .select('api_key, is_subscribed, is_elite, stripe_customer_id, telegram_chat_id, telegram_tags, referral_code, referral_count, subscription_end_at')
          .eq('email', user.email)
          .single();
        setProfile(data);
      }
      setLoading(false);
    }
    loadData();
  }, [supabase]);

  const copyToClipboard = () => {
    if (!profile?.referral_code) return;
    const link = `https://www.signalrelayhub.io/r/${profile.referral_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const automationBase = process.env.NEXT_PUBLIC_APP_URL ?? 'https://signalrelayhub.io';

  const plans: Record<string, { name: string; color: string; label: string; description: string }> = {
    elite: {
      name: 'Elite - £150 per month',
      color: 'border-amber-400/40 bg-amber-400/5',
      label: 'text-amber-300',
      description: 'Full Elite access - AI trade predictions, daily briefing, priority alerts.',
    },
    pro: {
      name: 'Pro - £45 per month',
      color: 'border-sky-400/40 bg-sky-400/5',
      label: 'text-sky-300',
      description: 'Pro access - Flash SEC alerts, Telegram, API key, pairs analysis.',
    },
    free: {
      name: 'Free plan',
      color: 'border-white/10 bg-white/5',
      label: 'text-white/50',
      description: 'Free access - view feed, markets and economic calendar.',
    },
  };

  if (loading) return <div className="p-8 text-white/50">Loading profile...</div>;

  const tier = profile?.is_elite ? 'elite' : profile?.is_subscribed ? 'pro' : 'free';
  const planName = plans[tier].name;
  const planColor = plans[tier].color;
  const planLabel = plans[tier].label;
  const planDescription = plans[tier].description;

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-neutral-950 p-8 text-white shadow-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Account</p>
        <h1 className="mt-3 text-3xl font-semibold">Manage your plan, API keys, and alerts.</h1>
        <p className="mt-3 text-sm text-white/70">
          {profile?.stripe_customer_id ? 'Welcome back' : 'Welcome to Signal Relay Hub'} — signed in as {userEmail || 'unknown user'}.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">

        <div className={`rounded-3xl border p-6 text-white ${planColor}`}>
          <div className={`text-xs uppercase tracking-wide font-semibold ${planLabel}`}>Current plan</div>
          <div className="mt-2 text-2xl font-bold text-white">{planName}</div>
          <p className="mt-1 text-sm text-white/60">{planDescription}</p>
          {(profile?.is_subscribed || profile?.is_elite) && profile?.subscription_end_at && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-white/40">Renews</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-mono text-white/70">
                {new Date(profile.subscription_end_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          )}
          {profile?.is_elite && (
            <div className="mt-3 flex flex-wrap gap-2">
              {['AI trade predictions', 'Daily briefing', 'Priority alerts', 'Email digest', 'Unlimited API'].map((f) => (
                <span key={f} className="rounded-full bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 text-xs text-amber-300">{f}</span>
              ))}
            </div>
          )}
          {profile?.is_subscribed && !profile?.is_elite && (
            <div className="mt-3 flex flex-wrap gap-2">
              {['Flash SEC alerts', 'Telegram alerts', 'API key', 'Pairs analysis', 'Digest archive'].map((f) => (
                <span key={f} className="rounded-full bg-sky-400/10 border border-sky-400/20 px-2 py-0.5 text-xs text-sky-300">{f}</span>
              ))}
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            {profile?.stripe_customer_id ? (
              <a href="/api/stripe/portal" className="rounded-full bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-white/90 transition-colors">
                Manage billing
              </a>
            ) : (
              <a href="/pricing" className="rounded-full bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-white/90 transition-colors">
                {profile?.is_subscribed ? 'View plans' : 'Explore plans'}
              </a>
            )}
            {!profile?.is_elite && (
              <a href="/pricing" className="rounded-full border border-amber-400/40 px-4 py-2 text-sm font-medium text-amber-300 hover:bg-amber-400/10 transition-colors">
                Upgrade to Elite
              </a>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
          <div className="text-xs uppercase tracking-wide text-white/50">API key</div>
          {profile?.api_key ? (
            <>
              <p className="mt-2 text-sm text-white/60">Use this bearer token for all API requests.</p>
              <div className="mt-3 rounded-2xl bg-white/5 border border-white/10 p-3 font-mono text-sm text-white/80 break-all">{profile.api_key}</div>
            </>
          ) : (
            <p className="mt-2 text-sm text-white/60">API key is provisioned automatically once your subscription is active.</p>
          )}
        </div>
        
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
          <div className="text-xs uppercase tracking-wide text-white/50">Referral programme</div>
          <div className="mt-2 text-xl font-semibold">Refer a friend — get 1 month free</div>
          <p className="mt-1 text-sm text-white/60">Share your referral link. When someone subscribes using your link you get one month free.</p>
          {profile?.referral_code ? (
            <div className="mt-4 space-y-3">
              <div className="rounded-xl bg-white/5 border border-white/10 p-3 flex items-center justify-between gap-3">
                <span className="font-mono text-sm text-white/80 truncate">
                  https://www.signalrelayhub.io/r/{profile.referral_code}
                </span>
                <button 
                  onClick={copyToClipboard}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shrink-0 bg-white/10 text-white hover:bg-white/20"
                >
                  {copied ? 'Copied ✓' : 'Copy link'}
                </button>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2">
                  <div className="text-xs text-white/50">Referrals</div>
                  <div className="text-xl font-bold text-emerald-400">{profile.referral_count ?? 0}</div>
                </div>
                <p className="text-xs text-white/50">Each successful referral earns you one month free on your current plan.</p>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-white/40">Sign up for Pro to get your referral link.</p>
          )}
        </div>
        
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
          <div className="text-xs uppercase tracking-wide text-white/50">Automation recipes</div>
          <p className="mt-2 text-sm text-white/60">Drop these into Zapier, n8n, or your own workers.</p>
          <div className="mt-4 space-y-4 text-xs">
            <div>
              <div className="font-semibold text-white/80 mb-1">Latest signals</div>
              <pre className="rounded-xl bg-black/30 border border-white/10 p-3 font-mono text-[11px] text-white/60 whitespace-pre-wrap overflow-x-auto">{`curl -H "Authorization: Bearer ${profile?.api_key ?? 'YOUR_API_KEY'}" \\\n  "${automationBase}/api/events?limit=10"`}</pre>
            </div>
            <div>
              <div className="font-semibold text-white/80 mb-1">Schedule a drip</div>
              <pre className="rounded-xl bg-black/30 border border-white/10 p-3 font-mono text-[11px] text-white/60 whitespace-pre-wrap overflow-x-auto">{`curl -X POST "${automationBase}/api/drip-queue" \\\n  -H "Authorization: Bearer ${profile?.api_key ?? 'YOUR_API_KEY'}" \\\n  -H "Content-Type: application/json" \\\n  -d '{"channel":"telegram","scheduledAt":"2026-04-02T09:00:00Z","text":"Top 5 signals"}'`}</pre>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-wide text-white/50">Telegram alerts</div>
              <div className="mt-1 text-xl font-semibold">Stay in sync via push</div>
            </div>
            {profile?.telegram_chat_id ? (
              <span className="inline-flex items-center rounded-full bg-emerald-400/10 border border-emerald-400/30 px-3 py-1 text-xs font-semibold text-emerald-300">Connected</span>
            ) : null}
          </div>
          {profile?.telegram_chat_id ? (
            <div className="mt-4">
              <p className="text-sm text-white/60">Select which tags should fire Telegram alerts.</p>
              <div className="mt-4 rounded-2xl border border-white/10 p-3">
                <TelegramTagSelector email={userEmail} initialTags={profile.telegram_tags ?? ['product', 'regulatory', 'funding', 'pricing', 'security']} />
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-3 text-sm text-white/60">
              <p>Connect Telegram to receive push alerts the second new signals land.</p>
              <ol className="list-decimal space-y-1 pl-5">
                <li>Open <a className="text-sky-400 hover:underline" href="https://t.me/signalrelayhub_bot" target="_blank" rel="noreferrer">@signalrelayhub_bot</a></li>
                <li>Send the command below.</li>
              </ol>
              <div className="rounded-xl bg-black/30 border border-white/10 p-2 font-mono text-xs text-white/70">/connect {userEmail}</div>
              <p className="text-xs text-white/40">Refresh this page after sending the command.</p>
            </div>
          )}
        </div>

      </section>
    </div>
  );
}
