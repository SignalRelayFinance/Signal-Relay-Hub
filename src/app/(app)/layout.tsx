import Link from 'next/link';
import { AuthProvider } from '@/components/auth-provider';
import { UserPill } from '@/components/user-pill';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="relative min-h-screen bg-neutral-950 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.15),_transparent_55%)]" />
        <div className="relative">
          <header className="border-b border-white/10 bg-white/5 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
              <Link href="/feed" className="text-sm font-semibold uppercase tracking-[0.3em] text-white">
                Signal Relay Hub
              </Link>
              <nav className="flex flex-wrap items-center gap-4 text-sm text-white/80">
                <Link className="hover:text-white" href="/feed">
                  Live Feed
                </Link>
                <Link className="hover:text-white" href="/markets">
                  Markets
                </Link>
                <Link className="hover:text-white" href="/digests">
                  Digest Archive
                </Link>
                <Link className="hover:text-white" href="/drip-queue">
                  Social Drip Queue
                </Link>
                <Link className="hover:text-white" href="/pricing">
                  Pricing
                </Link>
                <Link className="hover:text-white" href="/settings">
                  Account
                </Link>
              </nav>
              <UserPill />
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-6 py-10 text-neutral-900">
            <div className="space-y-8">{children}</div>
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
