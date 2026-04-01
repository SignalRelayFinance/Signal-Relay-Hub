import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing Supabase service credentials');
  }
  return createClient(url, key);
}

export async function POST(req: Request) {
  const supabase = getServiceClient();
  const body = await req.json().catch(() => null);
  const scheduledAt = body?.scheduledAt;
  const channel = body?.channel;
  const text = body?.text;

  if (!scheduledAt || !channel || !text) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const { error } = await supabase.from('drip_queue').insert({
    scheduled_at: scheduledAt,
    channel,
    text,
    status: 'queued',
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
