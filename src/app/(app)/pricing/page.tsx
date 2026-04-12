/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';

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
      .select('is_subscribed, api_key, stripe_customer_id')
      .eq('email', user.email)
      .single();
    profile = data;
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-neutral-950 p-8 text-white shadow-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Pricing</p>
        <h1 className="mt-3 text-3xl font-semibold">Simple, transparent pricing.</h1>
        <p className="mt-3 text-sm text-white/70">One plan. Everything included. Cancel anytime.</p>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
          <div className="text-xs uppercase tracking-wide text-white/50">Free</div>
          <div className="mt-3 text-4xl font-bold">£0</div>
          <div className="mt-1 text-sm text-white/50">No card required</div>
          <ul className="mt-6 space-y-3 text-sm text-white/70">
            <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> View live feed</li>
            <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Browse digest archive</li>
            <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span> Markets page with live prices</li>
            <li className="flex items-center gap-2"><span className="text-white/30">✗</span> Telegram push alerts</li>
            <li className="flex items-center gap-2"><span className="text-white/30">✗</span> API access</li>
            <li className="flex items-center gap-2"><span className="text-white/30">✗</span> Flash SEC filings</li>
            <li className="flex items-center gap-2"><span className="text-white/30">✗</span> Market pair impact analysis</li>
          </ul>
          {!user ? (
            <Link href="/login" className="mt-8 block w-full rounded-full border border-white/20 py-2.5 text-center text-sm font-medium text-white hover:bg-white/10 transition-colors">
              Sign in free
            </Link>
          ) : !profile?.is_subscribed ? (
            <div className="mt-8 block w-full rounded-full border border-white/20 py-2.5 text-center text-sm font-medium text-white/50">
              Current plan
            </div>
          ) : null}
        </div>

        <div className="rounded-3xl border border-sky-400/40 bg-sky-400/10 p-6 text-white lg:col-span-2 relative">
          <div className="absolute top-4 right-4 rounded-full bg-sky-400 px-3 py-1 text-xs font-semibold text-neutral-900">Most popular</div>
          <div className="text-xs uppercase tracking-wide text-sky-300">Pro</div>
          <div className="mt-3 text-4xl font-bold">£45<span className="text-xl font-normal text-white/50">/month</span></div>
          <div className="mt-1 text-sm text-white/50">Cancel anytime · API key provisioned instantly</div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 text-sm text-white/80">
            <div className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✓</span><span>Flash SEC alerts — 8-K, 13D/G, Form 4 filings</span></div>
            <div className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✓</span><span>28+ live sources — AI labs, fintechs, regulators</span></div>
            <div className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✓</span><span>Telegram push alerts with tag filtering</span></div>
            <div className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✓</span><span>Market pair impact analysis (EURUSD, XAUUSD, BTC)</span></div>
            <div className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✓</span><span>Self-serve API key for your own stack</span></div>
            <div className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✓</span><span>Digest archive with full history</span></div>
            <div className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✓</span><span>Social drip queue for X, Telegram, email</span></div>
            <div className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">✓</span><span>6-hourly pipeline updates, 24/7</span></div>
          </div>

          {profile?.is_subscribed ? (
            <div className="mt-8 space-y-3">
              <div className="rounded-2xl bg-emerald-400/10 border border-emerald-400/30 p-4">
                <div className="text-xs uppercase tracking-wide text-emerald-300 mb-1">Active subscription</div>
                <div className="text-sm text-white/80">You are on the Pro plan.</div>
                {profile.api_key && (
                  <div className="mt-2">
                    <div className="text-xs text-white/50 mb-1">Your API key</div>
                    <div className="rounded-xl bg-white/5 p-2 font-mono text-xs text-white/80 break-all">{profile.api_key}</div>
                  </div>
                )}
              </div>
              <a href="/api/stripe/checkout" className="block w-full rounded-full bg-white py-2.5 text-center text-sm font-semibold text-neutral-900 hover:bg-white/90 transition-colors">
                Manage billing
              </a>
            </div>
          ) : (
            <a href="/api/stripe/checkout" className="mt-8 block w-full rounded-full bg-white py-2.5 text-center text-sm font-semibold text-neutral-900 hover:bg-white/90 transition-colors">
              {user ? 'Subscribe now — £45/month' : 'Get started — £45/month'}
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
            <div className="mt-1 text-white/60">Instantly after checkout completes. It appears on your account page and the pricing page once subscribed.</div>
          </div>
          <div>
            <div className="font-medium text-white">How often does the feed update?</div>
            <div className="mt-1 text-white/60">Every 6 hours automatically. Flash SEC filings are captured as they appear on EDGAR.</div>
          </div>
          <div>
            <div className="font-medium text-white">Can I use this with my own tools?</div>
            <div className="mt-1 text-white/60">Yes — the API key lets you pull signals into Zapier, n8n, or your own code. Full REST API included.</div>
          </div>
        </div>
      </section>
    </div>
  );
}
