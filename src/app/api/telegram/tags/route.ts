import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.email || !body?.tags) {
    return NextResponse.json({ error: 'missing email or tags' }, { status: 400 });
  }

  const supabase = getServiceClient();
  const { error } = await supabase
    .from('profiles')
    .update({ telegram_tags: body.tags })
    .eq('email', body.email);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
