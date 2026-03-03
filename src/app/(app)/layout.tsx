import Link from 'next/link';
import { AuthProvider } from '@/components/auth-provider';
import { UserPill } from '@/components/user-pill';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen">
        <header className="border-b">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
            <Link href="/feed" className="font-semibold">
              Signal Relay Hub
            </Link>
            <nav className="flex flex-wrap items-center gap-4 text-sm text-neutral-700">
              <Link className="hover:underline" href="/feed">
                Live Feed
              </Link>
              <Link className="hover:underline" href="/digests">
                Digest Archive
              </Link>
              <Link className="hover:underline" href="/drip-queue">
                Social Drip Queue
              </Link>
              <Link className="hover:underline" href="/settings">
                Account
              </Link>
            </nav>
            <UserPill />
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </div>
    </AuthProvider>
  );
}
