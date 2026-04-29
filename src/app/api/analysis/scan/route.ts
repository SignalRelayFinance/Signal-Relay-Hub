import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST() {
  // Check auth — only Pro/Elite can trigger scans
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_subscribed, is_elite, last_scan_at')
    .eq('email', user.email)
    .single();

  if (!profile?.is_subscribed && !profile?.is_elite) {
    return NextResponse.json({ error: 'Pro or Elite required' }, { status: 403 });
  }

  // Rate limit — max 1 scan per 30 minutes per user
  if (profile.last_scan_at) {
    const lastScan = new Date(profile.last_scan_at).getTime();
    const thirtyMins = 30 * 60 * 1000;
    const nextScan = lastScan + thirtyMins;
    if (Date.now() < nextScan) {
      const waitMins = Math.ceil((nextScan - Date.now()) / 60000);
      return NextResponse.json({
        error: `Scan cooldown active. Next scan available in ${waitMins} minute${waitMins === 1 ? '' : 's'}.`,
        cooldown: true,
        next_scan_at: new Date(nextScan).toISOString(),
      }, { status: 429 });
    }
  }

  // Update last_scan_at
  await supabase
    .from('profiles')
    .update({ last_scan_at: new Date().toISOString() })
    .eq('email', user.email);

  const secret = process.env.PROVISION_WEBHOOK_SECRET;
  const headers = {
    'Content-Type': 'application/json',
    'x-provision-secret': secret ?? '',
  };

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.signalrelayhub.io';

  // Fire pairs analysis
  await fetch(`${base}/api/analysis/pairs`, { method: 'POST', headers });

  // Wait 20s then fire predictions
  await new Promise(r => setTimeout(r, 20000));
  await fetch(`${base}/api/analysis/predict`, { method: 'POST', headers });

  return NextResponse.json({ ok: true, scanned_at: new Date().toISOString() });
}
