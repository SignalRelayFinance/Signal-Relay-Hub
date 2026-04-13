import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
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
    return NextResponse.json({ is_elite: false, is_subscribed: false });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_elite, is_subscribed, api_key')
    .eq('email', user.email)
    .single();

  return NextResponse.json(profile ?? { is_elite: false, is_subscribed: false });
}
