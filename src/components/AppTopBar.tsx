'use client';

import { usePathname } from 'next/navigation';

const PAGE_LABELS: Record<string, string> = {
  '/feed': 'Live Feed',
  '/traders-circle': 'Traders Circle',
  '/markets': 'Markets',
  '/ai-assistant': 'AI Assistant',
  '/digests': 'Digest Archive',
  '/drip-queue': 'Drip Queue',
  '/pricing': 'Pricing',
  '/settings': 'Account',
  '/disclaimer': 'Disclaimer',
};

export function AppTopBar() {
  const pathname = usePathname();
  const label = PAGE_LABELS[pathname] ?? 'Signal Relay Hub';

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center border-b border-white/5 bg-neutral-950/80 backdrop-blur px-4 py-3 sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-white">{label}</span>
        </div>
      </div>

      {/* Desktop top bar */}
      <div className="hidden lg:flex items-center justify-between border-b border-white/5 bg-neutral-950/30 backdrop-blur px-6 py-3 sticky top-0 z-20">
        <div className="flex items-center gap-2 text-xs font-mono text-white/30">
          <span>signalrelayhub.io</span>
          <span className="text-white/15">/</span>
          <span className="text-white/60">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          
            href="https://t.me/signalrelayhub"
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            Telegram ↗
          </a>
          
            href="https://discord.gg/4X9NGZuK"
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            Discord ↗
          </a>
        </div>
      </div>
    </>
  );
}
