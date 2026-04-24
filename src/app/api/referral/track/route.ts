import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: Request) {
  const { referral_code } = await req.json();
  if (!referral_code) return NextResponse.json({ error: 'No referral code' }, { status: 400 });

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
  if (!user?.email) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });

  const admin = getServiceClient();

  // Check referral code exists
  const { data: referrer } = await admin
    .from('profiles')
    .select('email, referral_count')
    .eq('referral_code', referral_code)
    .single();

  if (!referrer) return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 });

  // Don't allow self-referral
  if (referrer.email === user.email) return NextResponse.json({ error: 'Cannot refer yourself' }, { status: 400 });

  // Update current user's referred_by if not already set
  const { data: currentProfile } = await admin
    .from('profiles')
    .select('referred_by')
    .eq('email', user.email)
    .single();

  if (currentProfile && !currentProfile.referred_by) {
    await admin
      .from('profiles')
      .update({ referred_by: referral_code })
      .eq('email', user.email);

    // Increment referrer's count
    await admin
      .from('profiles')
      .update({ referral_count: (referrer.referral_count ?? 0) + 1 })
      .eq('email', referrer.email);
  }

  return NextResponse.json({ ok: true });
}
