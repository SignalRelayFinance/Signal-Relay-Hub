'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/feed', label: '📡 Live Feed' },
  { href: '/markets', label: '📊 Markets' },
  { href: '/digests', label: '📅 Digest Archive' },
  { href: '/drip-queue', label: '📤 Social Drip Queue' },
  { href: '/pricing', label: '💳 Pricing' },
  { href: '/settings', label: '⚙️ Account' },
  { href: '/privacy', label: '🔒 Privacy Policy' },
];

export function MobileNav({ userEmail, onSignOut }: { userEmail?: string | null; onSignOut?: () => void }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="flex flex-col gap-1.5 p-2 md:hidden relative z-50"
        aria-label="Open menu"
      >
        <span className={`block h-0.5 w-6 bg-white transition-all duration-300 ${open ? 'rotate-45 translate-y-2' : ''}`} />
        <span className={`block h-0.5 w-6 bg-white transition-all duration-300 ${open ? 'opacity-0' : ''}`} />
        <span className={`block h-0.5 w-6 bg-white transition-all duration-300 ${open ? '-rotate-45 -translate-y-2' : ''}`} />
      </button>

      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-neutral-950 border-l border-white/10 flex flex-col shadow-2xl">
            
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
              <span className="text-sm font-semibold uppercase tracking-[0.3em] text-white">Menu</span>
              <button 
                onClick={() => setOpen(false)} 
                className="h-8 w-8 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-3 px-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center px-4 py-3.5 rounded-xl mb-1 text-sm font-medium transition-all ${
                    pathname === link.href
                      ? 'text-white bg-white/15 border border-white/20'
                      : 'text-white/70 hover:text-white hover:bg-white/10 border border-transparent'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="border-t border-white/10 p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <a 
                  href="https://t.me/signalrelayhub" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center justify-center gap-2 rounded-xl border border-sky-500/30 bg-sky-500/10 py-2.5 text-xs font-medium text-sky-300 hover:bg-sky-500/20 transition-colors"
                >
                  📲 Telegram
                </a>
                <a 
                  href="https://discord.gg/4X9NGZuK" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center justify-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 py-2.5 text-xs font-medium text-indigo-300 hover:bg-indigo-500/20 transition-colors"
                >
                  💬 Discord
                </a>
              </div>

              {userEmail ? (
                <div className="space-y-2">
                  <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <div className="text-xs text-white/40 mb-0.5">Signed in as</div>
                    <div className="text-xs text-white/70 truncate">{userEmail}</div>
                  </div>
                  <button
                    onClick={() => { onSignOut?.(); setOpen(false); }}
                    className="w-full rounded-xl border border-rose-500/30 bg-rose-500/10 py-2.5 text-xs font-medium text-rose-300 hover:bg-rose-500/20 transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="block w-full rounded-xl bg-white py-2.5 text-center text-sm font-semibold text-neutral-900 hover:bg-white/90 transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/pricing"
                    onClick={() => setOpen(false)}
                    className="block w-full rounded-xl border border-amber-400/30 bg-amber-400/10 py-2.5 text-center text-sm font-medium text-amber-300 hover:bg-amber-400/20 transition-colors"
                  >
                    Get started free
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
