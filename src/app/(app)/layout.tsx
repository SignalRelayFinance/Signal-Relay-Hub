import Link from 'next/link';
import { AuthProvider } from '@/components/auth-provider';
import { UserPill } from '@/components/user-pill';
import { MobileNav } from '@/components/MobileNav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="relative min-h-screen bg-neutral-950 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.15),_transparent_55%)]" />
        <div className="relative">
          <header className="border-b border-white/10 bg-white/5 backdrop-blur sticky top-0 z-40">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
             <Link href="/" className="text-sm font-semibold uppercase tracking-[0.3em] text-white">
              Signal Relay Hub
            </Link>
              <nav className="hidden md:flex items-center gap-4 text-sm text-white/80">
                <Link className="hover:text-white" href="/feed">Live Feed</Link>
                <Link className="hover:text-white" href="/traders-circle">Traders Circle</Link>
                <Link className="hover:text-white" href="/markets">Markets</Link>
                <Link className="hover:text-white" href="/digests">Digest Archive</Link>
                <Link className="hover:text-white" href="/drip-queue">Social Drip Queue</Link>
                <Link className="hover:text-white" href="/pricing">Pricing</Link>
                <Link className="hover:text-white" href="/ai-assistant">AI Assistant</Link>
                <Link className="hover:text-white" href="/settings">Account</Link>
              </nav>
              <div className="flex items-center gap-3">
                <div className="hidden md:block">
                  <UserPill />
                </div>
                <MobileNav />
              </div>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-6 py-10 text-neutral-900">
            <div className="space-y-8">{children}</div>
          </main>
          <footer className="border-t border-white/10 py-6 text-center text-xs text-white/40">
            <div className="mx-auto max-w-6xl px-6">
              <div className="mb-4 rounded-xl border border-amber-400/10 bg-amber-400/5 px-4 py-3 text-xs text-amber-400/60 text-left leading-relaxed">
                <span className="font-semibold text-amber-400/80">⚠️ Risk Disclaimer:</span> Signal Relay Hub provides market intelligence and AI-generated analysis for <span className="font-semibold">educational and informational purposes only</span>. Nothing on this platform constitutes financial advice, investment advice, trading advice, or any other form of regulated financial guidance. All signals, trade predictions, AI analysis and market commentary are generated automatically and may be inaccurate, incomplete or delayed. Past signal performance does not guarantee future results. Trading financial instruments including forex, cryptocurrencies, commodities and indices involves substantial risk of loss and is not suitable for all investors. You may lose more than your initial investment. By using Signal Relay Hub you acknowledge that you trade entirely at your own risk and that Signal Relay Hub, its operators and affiliates accept no liability for any losses incurred. Always conduct your own research and consult a qualified financial advisor before making any trading decisions.
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <span>© 2026 Signal Relay Hub</span>
                <a href="/privacy" className="hover:text-white/70 transition-colors">Privacy Policy</a>
                <a href="/disclaimer" className="hover:text-white/70 transition-colors">Risk Disclaimer</a>
                <a href="/pricing" className="hover:text-white/70 transition-colors">Pricing</a>
                <a href="https://t.me/signalrelayhub" target="_blank" rel="noreferrer" className="hover:text-white/70 transition-colors">Telegram</a>
                <a href="https://discord.gg/4X9NGZuK" target="_blank" rel="noreferrer" className="hover:text-white/70 transition-colors">Discord</a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </AuthProvider>
  );
}
