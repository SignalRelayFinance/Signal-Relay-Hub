import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function sendMessage(chatId: string, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  });
}

export async function POST(req: Request) {
  const secret = process.env.PROVISION_WEBHOOK_SECRET;
  if (secret) {
    const got = req.headers.get('x-provision-secret');
    if (got !== secret) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const supabase = getServiceClient();

  // Get events from last 7 hours (slightly more than cron interval)
  const since = new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString();

  const { data: events } = await supabase
    .from('sf_events')
    .select('title, company, primary_tag, impact_score, link, summary')
    .gte('fetched_at', since)
    .gte('impact_score', 3)
    .order('impact_score', { ascending: false })
    .limit(5);

  if (!events || events.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 });
  }

  // Get all connected users
  const { data: profiles } = await supabase
    .from('profiles')
    .select('telegram_chat_id, telegram_tags')
    .not('telegram_chat_id', 'is', null)
    .eq('is_subscribed', true);

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 });
  }

  // Build message
  const lines = events.map((e) => {
    const impact = e.impact_score ? `⚡ Impact ${e.impact_score}` : '';
    const tag = e.primary_tag ? `[${e.primary_tag}]` : '';
    const summary = e.summary ? `\n${e.summary.slice(0, 120)}...` : '';
    return `<b>${e.company} ${tag} ${impact}</b>\n${e.title}${summary}\n${e.link ?? ''}`;
  }).join('\n\n─────────────\n\n');

  const message = `🔔 <b>Signal Relay Hub — New Signals</b>\n\n${lines}`;

  // Send to all connected users
  let sent = 0;
  for (const profile of profiles) {
    if (!profile.telegram_chat_id) continue;
    const userTags = profile.telegram_tags ?? ['product', 'regulatory', 'funding', 'pricing', 'security'];
    const relevant = events.filter((e) => !e.primary_tag || userTags.includes(e.primary_tag));
    if (relevant.length === 0) continue;
    await sendMessage(profile.telegram_chat_id, message);
    sent++;
  }

  return NextResponse.json({ ok: true, sent });
}
