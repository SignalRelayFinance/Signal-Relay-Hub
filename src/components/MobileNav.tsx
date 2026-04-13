'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/feed', label: 'Live Feed' },
  { href: '/markets', label: 'Markets' },
  { href: '/digests', label: 'Digest Archive' },
  { href: '/drip-queue', label: 'Social Drip Queue' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/settings', label: 'Account' },
  { href: '/privacy', label: 'Privacy Policy' },
];

export function MobileNav({ userEmail, onSignOut }: { userEmail?: string | null; onSignOut?: () => void }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex flex-col gap-1.5 p-2 md:hidden"
        aria-label="Open menu"
      >
        <span className="block h-0.5 w-5 bg-white" />
        <span className="block h-0.5 w-5 bg-white" />
        <span className="block h-0.5 w-5 bg-white" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-neutral-900 border-r border-white/10 flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
              <span className="text-sm font-semibold uppercase tracking-[0.3em] text-white">Signal Relay Hub</span>
              <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white text-xl">✕</button>
            </div>

            <nav className="flex-1 overflow-y-auto py-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center px-6 py-3 text-sm transition-colors ${
                    pathname === link.href
                      ? 'text-white bg-white/10 border-l-2 border-white'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="border-t border-white/10 p-6 space-y-4">
              <div className="flex gap-3">
                <a href="https://t.me/signalrelayhub" target="_blank" rel="noreferrer" className="flex-1 rounded-full border border-white/20 py-2 text-center text-xs text-white/70 hover:bg-white/10 transition-colors">
                  Telegram
                </a>
                <a href="https://discord.gg/4X9NGZuK" target="_blank" rel="noreferrer" className="flex-1 rounded-full border border-white/20 py-2 text-center text-xs text-white/70 hover:bg-white/10 transition-colors">
                  Discord
                </a>
              </div>
              {userEmail ? (
                <div className="space-y-2">
                  <div className="text-xs text-white/40 truncate">{userEmail}</div>
                  <button
                    onClick={() => { onSignOut?.(); setOpen(false); }}
                    className="w-full rounded-full border border-white/20 py-2 text-xs text-white/70 hover:bg-white/10 transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="block w-full rounded-full bg-white py-2 text-center text-xs font-semibold text-neutral-900 hover:bg-white/90 transition-colors"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
