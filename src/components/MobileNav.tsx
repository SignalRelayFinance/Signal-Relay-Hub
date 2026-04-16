'use client';
import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="flex flex-col gap-1.5 p-2 md:hidden relative z-50"
        aria-label="Toggle menu"
      >
        <span className={['block h-0.5 w-6 bg-white transition-all duration-300', open ? 'rotate-45 translate-y-2' : ''].join(' ')} />
        <span className={['block h-0.5 w-6 bg-white transition-all duration-300', open ? 'opacity-0 w-0' : ''].join(' ')} />
        <span className={['block h-0.5 w-6 bg-white transition-all duration-300', open ? '-rotate-45 -translate-y-2' : ''].join(' ')} />
      </button>

      {open && (
        <div className="fixed inset-0 z-40 md:hidden" style={{ top: 0, left: 0, right: 0, bottom: 0 }}>
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-3 top-16 w-72 rounded-2xl border border-white/20 bg-neutral-950 shadow-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.2em] text-white/50">Navigation</span>
              <button
                onClick={() => setOpen(false)}
                className="h-6 w-6 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <nav className="p-3 space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    pathname === link.href
                      ? 'text-white bg-white/15 border border-white/20'
                      : 'text-white/70 hover:text-white hover:bg-white/10 border border-transparent'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="border-t border-white/10 p-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                
                  href="https://t.me/signalrelayhub"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-sky-500/30 bg-sky-500/10 py-2 text-xs font-medium text-sky-300 hover:bg-sky-500/20 transition-colors"
                >
                  📲 Telegram
                </a>
                
                  href="https://discord.gg/4X9NGZuK"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 py-2 text-xs font-medium text-indigo-300 hover:bg-indigo-500/20 transition-colors"
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
                    className="w-full rounded-xl border border-rose-500/30 bg-rose-500/10 py-2 text-xs font-medium text-rose-300 hover:bg-rose-500/20 transition-colors"
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
