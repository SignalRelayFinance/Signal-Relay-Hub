import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function sendTelegramMessage(chatId: string, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  });
}

async function sendToPublicTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: '@signalrelayhub', text, parse_mode: 'HTML' }),
  });
}

async function sendToDiscord(content: string) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;
  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ content }),
  });
}

export async function POST(req: Request) {
  const secret = process.env.PROVISION_WEBHOOK_SECRET;
  if (secret && req.headers.get('x-provision-secret') !== secret) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const supabase = getServiceClient();
  const since = new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString();

  const { data: events } = await supabase
    .from('sf_events')
    .select('title, company, primary_tag, impact_score, link, summary, pairs_analysis')
    .gte('fetched_at', since)
    .gte('impact_score', 3)
    .order('impact_score', { ascending: false })
    .limit(5);

  if (!events || events.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 });
  }

  const { data: profiles } = await supabase
    .from('profiles')
    .select('telegram_chat_id, telegram_tags')
    .not('telegram_chat_id', 'is', null)
    .eq('is_subscribed', true);

  // Build public message (no trade predictions)
  const publicLines = events.map((e) => {
    const impact = e.impact_score ? `⚡ Impact ${e.impact_score}` : '';
    const tag = e.primary_tag ? `[${e.primary_tag}]` : '';
    const summary = e.summary ? `\n${e.summary.slice(0, 100)}...` : '';
    const pairs = e.pairs_analysis?.pairs?.slice(0, 3)
      .map((p: { pair: string; direction: string }) => `${p.pair} ${p.direction === 'bullish' ? '▲' : p.direction === 'bearish' ? '▼' : '—'}`)
      .join(' · ') ?? '';
    return `<b>${e.company} ${tag} ${impact}</b>\n${e.title}${summary}${pairs ? `\n📊 ${pairs}` : ''}\n${e.link ?? ''}`;
  }).join('\n\n─────────────\n\n');

  const publicMessage = `🔔 <b>Signal Relay Hub — New Signals</b>\n\n${publicLines}\n\n🎯 Full analysis + trade predictions → https://www.signalrelayhub.io/pricing`;

  // Post to public Telegram channel
  await sendToPublicTelegram(publicMessage);

  // Post to Discord #daily-signals
  const discordMessage = events.map((e) => {
    const pairs = e.pairs_analysis?.pairs?.slice(0, 3)
      .map((p: { pair: string; direction: string; strength: number }) => `${p.pair} ${p.direction === 'bullish' ? '▲' : '▼'} ${'●'.repeat(p.strength)}`)
      .join(' · ') ?? '';
    return `**${e.company}** [${e.primary_tag}] ⚡ Impact ${e.impact_score}\n${e.title}\n${pairs ? `📊 ${pairs}\n` : ''}${e.link ?? ''}`;
  }).join('\n\n──────────────\n\n');

  await sendToDiscord(`🔔 **Signal Relay Hub — New Signals**\n\n${discordMessage}\n\n🎯 Full analysis + trade predictions → https://www.signalrelayhub.io/pricing`);

  // Send to individual Pro/Elite subscribers
  let sent = 0;
  if (profiles) {
    for (const profile of profiles) {
      if (!profile.telegram_chat_id) continue;
      const userTags = profile.telegram_tags ?? ['product', 'regulatory', 'funding', 'pricing', 'security'];
      const relevant = events.filter((e) => !e.primary_tag || userTags.includes(e.primary_tag));
      if (relevant.length === 0) continue;
      await sendTelegramMessage(profile.telegram_chat_id, publicMessage);
      sent++;
    }
  }

  return NextResponse.json({ ok: true, sent });
}
