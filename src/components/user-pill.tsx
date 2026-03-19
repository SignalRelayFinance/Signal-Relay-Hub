'use client';

import { useAuth } from '@/components/auth-provider';

export function UserPill() {
  const { user, loading, signOut } = useAuth();

  if (loading) return <div className="text-xs text-neutral-500">Loading…</div>;
  if (!user) return <div className="text-xs text-neutral-500">Not signed in</div>;

  return (
    <div className="flex items-center gap-2">
      <div className="rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-700">
        {user.email}
      </div>
      <button className="text-xs text-neutral-600 hover:underline" onClick={() => void signOut()}>
        Sign out
      </button>
    </div>
  );
}
