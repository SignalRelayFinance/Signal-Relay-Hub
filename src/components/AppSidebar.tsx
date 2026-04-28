'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { UserPill } from '@/components/user-pill';

const NAV_GROUPS = [
  {
    label: 'Markets',
    items: [
      { href: '/feed', label: 'Live Feed', icon: '📡' },
      { href: '/traders-circle', label: 'Traders Circle', icon: '🔴', badge: 'LIVE' },
      { href: '/markets', label: 'Markets', icon: '📊' },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { href: '/ai-assistant', label: 'AI Assistant', icon: '⭐', badge: 'Elite' },
      { href: '/digests', label: 'Digest Archive', icon: '📁' },
      { href: '/drip-queue', label: 'Drip Queue', icon: '📤' },
    ],
  },
  {
    label: 'Account',
    items: [
      { href: '/pricing', label: 'Pricing', icon: '💎' },
      { href: '/settings', label: 'Account', icon: '⚙️' },
      { href: '/disclaimer', label: 'Disclaimer', icon: '⚠️' },
    ],
  },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-neutral-950 border-r border-white/5">
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-white/5">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        <Link href="/feed" onClick={onClose} className="font-mono text-xs font-bold uppercase tracking-widest text-white truncate">
          Signal Relay Hub
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-5">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            <div className="px-3 mb-1 text-xs font-mono uppercase tracking-widest text-white/20">
              {group.label}
            </div>
            <div className="space-y-0.5">
              {group.items.map(item => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-all ${
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-white/40 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm leading-none">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`rounded px-1.5 py-0.5 text-xs font-bold shrink-0 ${
                        item.badge === 'Elite' ? 'bg-amber-400/20 text-amber-400' :
                        item.badge === 'LIVE' ? 'bg-emerald-400/20 text-emerald-400' :
                        'bg-white/10 text-white/50'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/5 p-3 space-y-2">
        <div className="rounded-lg border border-amber-400/10 bg-amber-400/5 px-2.5 py-2">
          <p className="text-xs text-amber-400/50 leading-relaxed">
            ⚠️ Educational only. Not financial advice. Trade at your own risk.
          </p>
        </div>
        <UserPill />
      </div>
    </div>
  );
}

export function AppSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile hamburger button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-3 right-4 z-40 lg:hidden flex flex-col gap-1 p-2 rounded-lg bg-neutral-900 border border-white/10"
        aria-label="Open menu"
      >
        <span className="block h-0.5 w-5 bg-white" />
        <span className="block h-0.5 w-5 bg-white" />
        <span className="block h-0.5 w-5 bg-white" />
      </button>

      {/* Mobile sidebar overlay */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64">
            <SidebarContent onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
