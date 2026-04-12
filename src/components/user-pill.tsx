'use client';
import { useAuth } from '@/components/auth-provider';
import Link from 'next/link';

export function UserPill() {
  const { user, loading, signOut } = useAuth();
  if (loading) return <div className="text-xs text-neutral-500">Loading…</div>;
  if (!user) return (
    <Link href="/login" className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/70 hover:text-white hover:border-white/40 transition-colors">
      Sign in
    </Link>
  );
  return (
    <div className="flex items-center gap-2">
      <div className="rounded-full bg-white/10 px-2 py-1 text-xs text-white/80">
        {user.email}
      </div>
      <button className="text-xs text-white/60 hover:text-white hover:underline" onClick={() => void signOut()}>
        Sign out
      </button>
    </div>
  );
}
