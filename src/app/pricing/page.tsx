/* eslint-disable react/no-unescaped-entities */
'use client';

import Link from 'next/link';
import { useState } from 'react';

const TIERS = [
  {
    name: 'Free',
    price: '£0',
    period: '',
    description: 'Get a feel for the platform. No card required.',
    color: 'border-white/10',
    highlight: false,
    badge: null,
    badgeColor: '',
    labelColor: 'text-white/50',
    ctaLabel: 'Start for free',
    ctaStyle: 'border border-white/20 text-white hover:bg-white/10',
    ctaHref: '/login',
    features: [
      'Live signal feed (5 signals/day)',
      'Markets page with TradingView charts',
      'Economic calendar',
      'Digest archive (last 3 days)',
      'Traders Circle — read only',
    ],
    locked: [
      'Telegram push alerts',
      'Flash SEC filings',
      'AI market pair analysis',
      'API access',
      'Trade predictions',
    ],
  },
  {
    name: 'Pro',
    price: '£45',
    period: '/month',
    description: 'For active traders who need speed and automation.',
    color: 'border-sky-400/40 bg-sky-400/5',
    highlight: true,
    badge: 'Most popular',
    badgeColor: 'bg-sky-400 text-neutral-900',
    labelColor: 'text-sky-300',
    ctaLabel: 'Get Pro — £45/mo',
    ctaStyle: 'bg-white text-neutral-900 hover:bg-white/90',
    ctaHref: '/login?plan=pro',
    features: [
      'Everything in Free',
      'Full signal feed — unlimited',
      'Flash SEC alerts — Form 4, 8-K, 13D/G',
      '28+ live sources — AI labs, fintechs, regulators',
      'Telegram push alerts with tag filtering',
      'AI market pair impact analysis',
      'Full digest archive history',
      'Traders Circle chat + trade ideas',
      'Pro badge in community',
      'Self-serve API key for your stack',
    ],
    locked: [
      'AI trade predictions',
      'Pre-event alerts',
      'AI Trading Assistant',
      'Weekly macro outlook',
    ],
  },
  {
    name: 'Elite',
    price: '£150',
    period: '/month',
    description: 'The full intelligence stack for serious traders.',
    color: 'border-amber-400/40 bg-amber-400/5',
    highlight: false,
    badge: 'Best for traders',
    badgeColor: 'bg-amber-400 text-neutral-900',
    labelColor: 'text-amber-300',
    ctaLabel: 'Get Elite — £150/mo',
    ctaStyle: 'bg-amber-400 text-neutral-900 hover:bg-amber-300',
    ctaHref: '/login?plan=elite',
    features: [
      'Everything in Pro',
      'AI trade predictions with confidence score',
      'Signals 30 min before Pro tier',
      'Daily AI briefing at 7am',
      'Pre-event alerts 15 min before red folder events',
      'Post-event AI debrief + updated trade setups',
      'Weekly macro outlook every Sunday',
      'AI Trading Assistant — scalp/swing/risk/full analysis',
      'Signal correlation alerts',
      'Elite badge in Traders Circle',
      'Unlimited API calls',
    ],
    locked: [],
  },
];

const FAQS = [
  {
    q: 'Do I need a credit card to start?',
    a: 'No. The free plan requires only your email address. You only need payment details when upgrading to Pro or Elite.',
  },
  {
    q: 'How does billing work?',
    a: 'Monthly subscription via Stripe. Cancel anytime from your account page — no contracts, no lock-in.',
  },
  {
    q: 'When do I get my API key?',
    a: 'Instantly after checkout completes. It appears on your account page immediately.',
  },
  {
    q: 'What are AI trade predictions?',
    a: 'Claude AI analyses high-impact signals and generates trade setups with entry zones, targets and stop losses using real-time prices from Twelve Data. Elite only.',
  },
  {
    q: 'What is the pre-event alert?',
    a: 'Elite members receive a Telegram alert 15 minutes before high-impact economic events drop, with AI analysis of the likely outcome and which pairs to watch.',
  },
  {
    q: 'Can I upgrade from Pro to Elite?',
    a: 'Yes — Stripe handles prorated billing automatically when you upgrade.',
  },
];

export default function PublicPricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="relative min-h-screen bg-neutral-950 text-white overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.1),transparent_50%)]" />

      <div className="relative mx-auto max-w-6xl px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-white">Signal Relay Hub</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-white/50 hover:text-white transition-colors">Sign in</Link>
            <Link href="/feed" className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/10 transition-colors">
              View live feed
            </Link>
          </div>
        </div>

        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono text-white/60">No credit card required to start</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Simple, transparent pricing</h1>
          <p className="text-lg text-white/50 max-w-xl mx-auto">
            Start free. Upgrade when you need the edge. Cancel anytime.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid gap-6 lg:grid-cols-3 mb-20">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl border p-6 flex flex-col ${tier.color} ${tier.highlight ? 'ring-1 ring-sky-400/30' : ''}`}
            >
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${tier.badgeColor}`}>
                    {tier.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <div className={`text-xs font-mono uppercase tracking-widest mb-3 ${tier.labelColor}`}>{tier.name}</div>
                <div className="flex items-end gap-1 mb-2">
                  <span className="text-4xl font-bold text-white">{tier.price}</span>
                  <span className="text-white/40 mb-1.5 text-sm">{tier.period}</span>
                </div>
                <p className="text-sm text-white/40">{tier.description}</p>
              </div>

              <Link
                href={tier.ctaHref}
                className={`block w-full rounded-xl py-3 text-center text-sm font-bold transition-colors mb-6 ${tier.ctaStyle}`}
              >
                {tier.ctaLabel}
              </Link>

              <div className="flex-1 space-y-2">
                {tier.features.map((f) => (
                  <div key={f} className="flex items-start gap-2 text-sm">
                    <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                    <span className="text-white/70">{f}</span>
                  </div>
                ))}
                {tier.locked.map((f) => (
                  <div key={f} className="flex items-start gap-2 text-sm">
                    <span className="text-white/20 mt-0.5 shrink-0">✗</span>
                    <span className="text-white/25">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Trust strip */}
        <div className="grid grid-cols-3 gap-4 mb-20">
          {[
            { icon: '🔒', label: 'No credit card', sub: 'Free plan needs email only' },
            { icon: '⚡', label: 'Instant access', sub: 'API key on checkout' },
            { icon: '↩️', label: 'Cancel anytime', sub: 'No contracts or lock-in' },
          ].map(item => (
            <div key={item.label} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className="text-sm font-semibold text-white">{item.label}</div>
              <div className="text-xs text-white/30 mt-0.5">{item.sub}</div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Frequently asked questions</h2>
          <div className="space-y-3 max-w-2xl mx-auto">
            {FAQS.map((faq, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="text-sm font-medium text-white">{faq.q}</span>
                  <span className={`text-white/30 transition-transform ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-white/50 leading-relaxed border-t border-white/5 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center mb-12">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to get started?</h2>
          <p className="text-white/40 mb-6 text-sm">Join traders and operators already using Signal Relay Hub.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/login" className="rounded-full bg-white px-6 py-3 text-sm font-bold text-neutral-900 hover:bg-white/90 transition-colors">
              Start for free →
            </Link>
            <Link href="/feed" className="rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white/60 hover:bg-white/10 transition-colors">
              View live feed
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/5 pt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-white/25">
          <span className="font-mono">© 2026 Signal Relay Hub</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white/50 transition-colors">Privacy</Link>
            <Link href="/disclaimer" className="hover:text-white/50 transition-colors">Disclaimer</Link>
            <a href="https://t.me/signalrelayhub" target="_blank" rel="noreferrer" className="hover:text-white/50 transition-colors">Telegram</a>
            <a href="https://discord.gg/4X9NGZuK" target="_blank" rel="noreferrer" className="hover:text-white/50 transition-colors">Discord</a>
          </div>
        </div>
        <div className="mt-4 text-xs text-white/15 text-center leading-relaxed">
          ⚠️ Signal Relay Hub is for educational and informational purposes only. Nothing constitutes financial advice. All signals and AI analysis carry risk. Trade at your own risk.
        </div>
      </div>
    </div>
  );
}
