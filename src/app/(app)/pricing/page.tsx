/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ReferralTracker } from './ReferralTracker';

export default async function PricingPage() {
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
      .select('is_subscribed, is_elite, api_key, stripe_customer_id')
      .eq('email', user.email)
      .single();
    profile = data;
  }

  return (
   <div className="space-y-8">
      <ReferralTracker />
      <section className="rounded-3xl bg-neutral-950 p-8 text-white shadow-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Pricing</p>
        <h1 className="mt-3 text-3xl font-semibold">Simple, transparent pricing.</h1>
        <p className="mt-3 text-sm text-white/70">Three tiers. Cancel anytime. No contracts.</p>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">

        {/* FREE */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
          <div className="text-xs uppercase tracking-wide text-white/50">Free</div>
          <div className="mt-3 text-4xl font-bold">£0</div>
          <div className="mt-1 text-sm text-white/50">No card required</div>
          <ul className="mt-6 space-y-3 text-sm text-white/70">
            <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> View live feed</li>
            <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Browse digest archive</li>
            <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Markets page with live prices</li>
            <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Economic calendar</li>
            <li className="flex items-center gap-2"><span className="text-white/30">✗</span> Telegram push alerts</li>
            <li className="flex items-center gap-2"><span className="text-white/30">✗</span> API access</li>
            <li className="flex items-center gap-2"><span className="text-white/30">✗</span> Flash SEC filings</li>
            <li className="flex items-center gap-2"><span className="text-white/30">✗</span> Market pair impact analysis</li>
            <li className="flex items-center gap-2"><span className="text-white/30">✗</span> Trade direction predictions</li>
          </ul>
          {!user ? (
            <Link href="/login" className="mt-8 block w-full rounded-full border border-white/20 py-2.5 text-center text-sm font-medium text-white hover:bg-white/10 transition-colors">
              Sign in free
            </Link>
          ) : !profile?.is_subscribed && !profile?.is_elite ? (
            <div className="mt-8 block w-full rounded-full border border-white/20 py-2.5 text-center text-sm font-medium text-white/50">
              Current plan
            </div>
          ) : null}
        </div>

        {/* PRO */}
        <div className="rounded-3xl border border-sky-400/40 bg-sky-400/10 p-6 text-white relative">
          <div className="absolute top-4 right-4 rounded-full bg-sky-400 px-3 py-1 text-xs font-semibold text-neutral-900">Most popular</div>
          <div className="text-xs uppercase tracking-wide text-sky-300">Pro</div>
          <div className="mt-3 text-4xl font-bold">£45<span className="text-xl font-normal text-white/50">/month</span></div>
          <div className="mt-1 text-sm text-white/50">Cancel anytime · API key instantly</div>
          <ul className="mt-6 space-y-3 text-sm text-white/70">
            <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✓</span><span>Everything in Free</span></li>
            <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✓</span><span>Flash SEC alerts — 8-K, 13D/G, Form 4</span></li>
            <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✓</span><span>28+ live sources — AI labs, fintechs, regulators</span></li>
            <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✓</span><span>Telegram push alerts with tag filtering</span></li>
            <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✓</span><span>Market pair impact analysis (EURUSD, XAUUSD, BTC)</span></li>
            <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✓</span><span>Self-serve API key for your stack</span></li>
            <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✓</span><span>Digest archive + social drip queue</span></li>
            <li className="flex items-start gap-2"><span className="text-white/30 mt-0.5">✗</span><span className="text-white/40">AI trade direction predictions</span></li>
            <li className="flex items-start gap-2"><span className="text-white/30 mt-0.5">✗</span><span className="text-white/40">Daily AI briefing</span></li>
            <li className="flex items-start gap-2"><span className="text-white/30 mt-0.5">✗</span><span className="text-white/40">Email digest delivery</span></li>
          </ul>
          {profile?.is_subscribed && !profile?.is_elite ? (
            <div className="mt-8 space-y-3">
              <div className="rounded-2xl bg-emerald-400/10 border border-emerald-400/30 p-4">
                <div className="text-xs uppercase tracking-wide text-emerald-300 mb-1">Active — Pro plan</div>
                {profile.api_key && (
                  <div className="mt-2">
                    <div className="text-xs text-white/50 mb-1">API key</div>
                    <div className="rounded-xl bg-white/5 p-2 font-mono text-xs text-white/80 break-all">{profile.api_key}</div>
                  </div>
                )}
              </div>
              <a href="/api/stripe/portal" className="block w-full rounded-full bg-white py-2.5 text-center text-sm font-semibold text-neutral-900 hover:bg-white/90 transition-colors">
                Manage billing
              </a>
            </div>
          ) : !profile?.is_elite ? (
            <a href="/api/stripe/checkout" className="mt-8 block w-full rounded-full bg-white py-2.5 text-center text-sm font-semibold text-neutral-900 hover:bg-white/90 transition-colors">
              {user ? 'Subscribe — £45/month' : 'Get started — £45/month'}
            </a>
          ) : null}
        </div>

        {/* ELITE */}
        <div className="rounded-3xl border border-amber-400/40 bg-amber-400/10 p-6 text-white relative">
          <div className="absolute top-4 right-4 rounded-full bg-amber-400 px-3 py-1 text-xs font-semibold text-neutral-900">Best for traders</div>
          <div className="text-xs uppercase tracking-wide text-amber-300">Elite</div>
          <div className="mt-3 text-4xl font-bold">£150<span className="text-xl font-normal text-white/50">/month</span></div>
          <div className="mt-1 text-sm text-white/50">Cancel anytime · Full AI analysis suite</div>
          <ul className="mt-6 space-y-3 text-sm text-white/70">
            <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✓</span><span>Everything in Pro</span></li>
            <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">✓</span><span>AI trade direction predictions — entry zones, targets, risks</span></li>
            <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">✓</span><span>Daily AI briefing — top 5 signals with market context</span></li>
            <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">✓</span><span>Economic calendar alerts — Telegram 15 min before red events</span></li>
            <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">✓</span><span>Email digest delivery — daily and weekly</span></li>
            <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">✓</span><span>Slack integration — signals to your team channel</span></li>
            <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">✓</span><span>Higher API rate limits — unlimited daily calls</span></li>
            <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">✓</span><span>Priority signal scoring with written analysis</span></li>
          </ul>
          {profile?.is_elite ? (
            <div className="mt-8 space-y-3">
              <div className="rounded-2xl bg-amber-400/10 border border-amber-400/30 p-4">
                <div className="text-xs uppercase tracking-wide text-amber-300 mb-1">Active — Elite plan</div>
                {profile.api_key && (
                  <div className="mt-2">
                    <div className="text-xs text-white/50 mb-1">API key</div>
                    <div className="rounded-xl bg-white/5 p-2 font-mono text-xs text-white/80 break-all">{profile.api_key}</div>
                  </div>
                )}
              </div>
              <a href="/api/stripe/portal" className="block w-full rounded-full bg-amber-400 py-2.5 text-center text-sm font-semibold text-neutral-900 hover:bg-amber-300 transition-colors">
                Manage billing
              </a>
            </div>
          ) : (
            <a href="/api/stripe/checkout-elite" className="mt-8 block w-full rounded-full bg-amber-400 py-2.5 text-center text-sm font-semibold text-neutral-900 hover:bg-amber-300 transition-colors">
              {user ? 'Upgrade to Elite — £150/month' : 'Get Elite — £150/month'}
            </a>
          )}
        </div>

      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
        <h2 className="text-lg font-semibold mb-4">Frequently asked questions</h2>
        <div className="grid gap-4 sm:grid-cols-2 text-sm">
          <div>
            <div className="font-medium text-white">How does billing work?</div>
            <div className="mt-1 text-white/60">Monthly subscription via Stripe. Cancel anytime from your account page — no contracts.</div>
          </div>
          <div>
            <div className="font-medium text-white">When do I get my API key?</div>
            <div className="mt-1 text-white/60">Instantly after checkout completes. It appears on your account and pricing page.</div>
          </div>
          <div>
            <div className="font-medium text-white">How often does the feed update?</div>
            <div className="mt-1 text-white/60">Every 6 hours automatically. Flash SEC filings are captured as they appear on EDGAR.</div>
          </div>
          <div>
            <div className="font-medium text-white">What are AI trade direction predictions?</div>
            <div className="mt-1 text-white/60">Elite members get Claude-generated trade setups on high-impact signals — direction, entry zone, target, and key risks for EURUSD, XAUUSD, BTCUSD and more.</div>
          </div>
          <div>
            <div className="font-medium text-white">Can I upgrade from Pro to Elite?</div>
            <div className="mt-1 text-white/60">Yes — click Upgrade to Elite and Stripe handles the prorated billing automatically.</div>
          </div>
          <div>
            <div className="font-medium text-white">Can I use this with my own tools?</div>
            <div className="mt-1 text-white/60">Yes — the API key works with Zapier, n8n, or your own code. Elite gets unlimited API calls.</div>
          </div>
        </div>
      </section>
    </div>
  );
}
