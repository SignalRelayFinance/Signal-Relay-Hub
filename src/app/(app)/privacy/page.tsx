/* eslint-disable react/no-unescaped-entities */
import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-neutral-950 p-8 text-white shadow-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Legal</p>
        <h1 className="mt-3 text-3xl font-semibold">Privacy Policy</h1>
        <p className="mt-3 text-sm text-white/70">Last updated: 13 April 2026</p>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-8 text-white space-y-8">

        <div>
          <h2 className="text-lg font-semibold mb-3">1. Who we are</h2>
          <p className="text-sm text-white/70 leading-relaxed">Signal Relay Hub is a market intelligence platform operated by SignalRelayFinance. We provide live financial signals, SEC filing alerts, economic calendar data, and AI-powered market analysis to traders and fintech operators. Our website is located at www.signalrelayhub.io.</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">2. Information we collect</h2>
          <div className="space-y-3 text-sm text-white/70 leading-relaxed">
            <p><span className="text-white font-medium">Account information:</span> When you sign up, we collect your email address via Supabase authentication (magic link login). We do not collect passwords.</p>
            <p><span className="text-white font-medium">Payment information:</span> Payments are processed by Stripe. We do not store your card details. We store your Stripe customer ID and subscription status to manage your account.</p>
            <p><span className="text-white font-medium">Telegram data:</span> If you connect your Telegram account, we store your Telegram chat ID to deliver push alerts. We do not store message content.</p>
            <p><span className="text-white font-medium">API usage:</span> We store API keys we generate for your account. We may log API requests for security and rate limiting purposes.</p>
            <p><span className="text-white font-medium">Usage data:</span> We may collect basic analytics such as pages visited and features used to improve the platform.</p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">3. How we use your information</h2>
          <div className="space-y-2 text-sm text-white/70 leading-relaxed">
            <p>We use your information to:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Provide and maintain your Signal Relay Hub subscription</li>
              <li>Send you signal alerts via Telegram based on your preferences</li>
              <li>Process payments and manage your billing</li>
              <li>Generate and manage your API key</li>
              <li>Respond to support requests</li>
              <li>Improve and develop the platform</li>
              <li>Comply with legal obligations</li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">4. Data storage and security</h2>
          <div className="space-y-3 text-sm text-white/70 leading-relaxed">
            <p>Your data is stored securely in Supabase (PostgreSQL database hosted on AWS). We use row-level security policies to ensure your data is only accessible to you and our service.</p>
            <p>API keys are generated using cryptographically secure random functions. We recommend treating your API key like a password — do not share it publicly.</p>
            <p>All data is transmitted over HTTPS. We do not sell your personal data to third parties.</p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">5. Third-party services</h2>
          <div className="space-y-2 text-sm text-white/70 leading-relaxed">
            <p>We use the following third-party services:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><span className="text-white">Supabase</span> — database and authentication</li>
              <li><span className="text-white">Stripe</span> — payment processing</li>
              <li><span className="text-white">Vercel</span> — hosting and deployment</li>
              <li><span className="text-white">Telegram</span> — push alert delivery</li>
              <li><span className="text-white">Anthropic Claude API</span> — AI-powered signal analysis</li>
              <li><span className="text-white">TradingView</span> — embedded market charts</li>
              <li><span className="text-white">Forex Factory</span> — economic calendar data</li>
            </ul>
            <p className="mt-2">Each of these services has their own privacy policy governing their use of data.</p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">6. Your rights</h2>
          <div className="space-y-2 text-sm text-white/70 leading-relaxed">
            <p>Under UK GDPR and applicable data protection law, you have the right to:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Request restriction of processing</li>
              <li>Data portability</li>
            </ul>
            <p className="mt-2">To exercise any of these rights, contact us at the email below.</p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">7. Cookies</h2>
          <p className="text-sm text-white/70 leading-relaxed">We use essential cookies only — specifically session cookies to keep you logged in. We do not use advertising or tracking cookies. We do not use Google Analytics or similar tracking tools.</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">8. Data retention</h2>
          <p className="text-sm text-white/70 leading-relaxed">We retain your account data for as long as your account is active. If you cancel your subscription and request account deletion, we will delete your personal data within 30 days, except where we are required to retain it for legal or financial compliance purposes.</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">9. Changes to this policy</h2>
          <p className="text-sm text-white/70 leading-relaxed">We may update this privacy policy from time to time. We will notify you of significant changes by email or via a notice on the platform. Continued use of Signal Relay Hub after changes constitutes acceptance of the updated policy.</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">10. Contact</h2>
          <p className="text-sm text-white/70 leading-relaxed">For any privacy-related questions or requests, contact us at:<br /><span className="text-white">privacy@signalrelayhub.io</span></p>
        </div>

      </section>
    </div>
  );
}
