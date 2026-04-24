'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export function ReferralTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (!ref) return;
    fetch('/api/referral/track', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ referral_code: ref }),
    }).catch(() => {});
  }, [searchParams]);

  return null;
}
