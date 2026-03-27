import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    const { data, error, count } = await admin
      .from('sf_events')
      .select('id', { count: 'exact' })
      .limit(1);
    return NextResponse.json({
      supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      connected: !error,
      error: error?.message ?? null,
      count,
      sample_id: data?.[0]?.id ?? null,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) });
  }
}
