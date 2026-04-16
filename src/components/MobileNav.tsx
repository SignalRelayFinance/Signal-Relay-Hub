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

  function openMenu() {
    setOpen(true);
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    setOpen(false);
    document.body.style.overflow = '';
  }

  return (
    <div className="md:hidden">
      <button onClick={openMenu} className="flex flex-col gap-1.5 p-2" aria-label="Open menu">
        <span className="block h-0.5 w-6 bg-white" />
        <span className="block h-0.5 w-6 bg-white" />
        <span className="block h-0.5 w-6 bg-white" />
      </button>

      {open && (
        <div className="fixed inset-0 z-40" style={{position:'fixed',top:0,left:0,right:0,bottom:0}}>
          <div className="absolute inset-0 bg-black/80" onClick={closeMenu} />
          <div className="absolute right-3 top-16 w-72 rounded-2xl border border-white/20 bg-neutral-950 shadow-2xl">
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-white/50">Menu</span>
              <button onClick={closeMenu} className="text-white/50 hover:text-white text-sm px-2 py-1 rounded border border-white/10">
                Close
              </button>
            </div>

            <nav className="p-3 space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${pathname === link.href ? 'text-white bg-white/15 border border-white/20' : 'text-white/70 hover:text-white hover:bg-white/10 border border-transparent'}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="border-t border-white/10 p-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <a href="https://t.me/signalrelayhub" target="_blank" rel="noreferrer" className="flex items-center justify-center rounded-xl border border-sky-500/30 bg-sky-500/10 py-2 text-xs font-medium text-sky-300">
                  Telegram
                </a>
                <a href="https://discord.gg/4X9NGZuK" target="_blank" rel="noreferrer" className="flex items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/10 py-2 text-xs font-medium text-indigo-300">
                  Discord
                </a>
              </div>

              {userEmail ? (
                <div className="space-y-2">
                  <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <div className="text-xs text-white/40">Signed in as</div>
                    <div className="text-xs text-white/70 truncate">{userEmail}</div>
                  </div>
                  <button onClick={() => { onSignOut?.(); closeMenu(); }} className="w-full rounded-xl border border-rose-500/30 bg-rose-500/10 py-2 text-xs font-medium text-rose-300">
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link href="/login" onClick={closeMenu} className="block w-full rounded-xl bg-white py-2.5 text-center text-sm font-semibold text-neutral-900">
                    Sign in
                  </Link>
                  <Link href="/pricing" onClick={closeMenu} className="block w-full rounded-xl border border-amber-400/30 bg-amber-400/10 py-2.5 text-center text-sm font-medium text-amber-300">
                    Get started free
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
