/* eslint-disable @typescript-eslint/no-explicit-any */
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
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true }),
  });
}

async function fetchCurrentPrices(): Promise<Record<string, number>> {
  const prices: Record<string, number> = {};
  try {
    const apiKey = process.env.TWELVE_DATA_API_KEY;
    if (!apiKey) return prices;
    const symbols = 'XAU/USD,BTC/USD,EUR/USD,GBP/USD,WTI/USD,US30/USD';
    const res = await fetch(
      `https://api.twelvedata.com/price?symbol=${encodeURIComponent(symbols)}&apikey=${apiKey}`
    );
    const data = await res.json();
    const map: Record<string, string> = {
      'XAU/USD': 'XAUUSD', 'BTC/USD': 'BTCUSD', 'EUR/USD': 'EURUSD',
      'GBP/USD': 'GBPUSD', 'WTI/USD': 'USOIL', 'US30/USD': 'US30',
    };
    for (const [symbol, key] of Object.entries(map)) {
      const price = data[symbol]?.price;
      if (price) prices[key] = parseFloat(price);
    }
  } catch { /* ignore */ }
  return prices;
}

async function generatePostEventDebrief(event: any, prices: Record<string, number>): Promise<string> {
  const pricesText = Object.entries(prices)
    .map(([k, v]) => `${k}: ${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 5 })}`)
    .join('\n');

  const actual = event.actual_value ?? 'N/A';
  const forecast = event.forecast ?? 'N/A';
  const previous = event.previous_value ?? 'N/A';

  let resultContext = 'inline with expectations';
  if (actual !== 'N/A' && forecast !== 'N/A') {
    try {
      const a = parseFloat(actual.replace(/[%KMB,]/g, ''));
      const f = parseFloat(forecast.replace(/[%KMB,]/g, ''));
      if (!isNaN(a) && !isNaN(f)) {
        if (a > f) resultContext = `BEAT expectations by ${(((a - f) / Math.abs(f)) * 100).toFixed(1)}%`;
        else if (a < f) resultContext = `MISSED expectations by ${(((f - a) / Math.abs(f)) * 100).toFixed(1)}%`;
      }
    } catch { /* ignore */ }
  }

  const prompt = `You are a professional macro trading analyst providing an immediate post-event debrief to Elite traders. An important economic event just printed its actual result.

EVENT RESULT:
Title: ${event.title}
Currency: ${event.currency ?? 'N/A'}
Actual: ${actual}
Forecast: ${forecast}
Previous: ${previous}
Result: ${resultContext}

CURRENT LIVE PRICES (post-event):
${pricesText}

Provide an immediate professional post-event debrief in this exact format:

RESULT: [BEAT/MISS/INLINE] — one sentence on what this means

IMMEDIATE MARKET IMPACT:
- [pair 1]: [direction and why, with specific price level]
- [pair 2]: [direction and why, with specific price level]
- [pair 3]: [direction and why, with specific price level]

TRADE SETUPS:
[IF BEAT]
- [best pair]: [direction] — Entry [price], Target [price], Stop [price]

[IF MISS]
- [best pair]: [direction] — Entry [price], Target [price], Stop [price]

FADE OR FOLLOW:
One sentence — should traders follow the initial move or fade it, and why.

RISK: One sentence on what could reverse this.

Be specific with prices. Base trade setups on current live prices above. Max 180 words.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await response.json();
  return data.content?.[0]?.text ?? 'Debrief unavailable';
}

function formatDebriefMessage(event: any, debrief: string): string {
  const actual = event.actual_value ?? 'N/A';
  const forecast = event.forecast ?? 'N/A';
  const previous = event.previous_value ?? 'N/A';

  let resultEmoji = '⚪';
  if (actual !== 'N/A' && forecast !== 'N/A') {
    try {
      const a = parseFloat(actual.replace(/[%KMB,]/g, ''));
      const f = parseFloat(forecast.replace(/[%KMB,]/g, ''));
      if (!isNaN(a) && !isNaN(f)) {
        if (a > f) resultEmoji = '🟢';
        else if (a < f) resultEmoji = '🔴';
      }
    } catch { /* ignore */ }
  }

  return `${resultEmoji} <b>ELITE POST-EVENT DEBRIEF</b>

<b>${event.title}</b>
📊 Actual: <b>${actual}</b> | Forecast: ${forecast} | Previous: ${previous}

🤖 <b>AI Debrief:</b>
${debrief}

─────────────
<i>Signal Relay Hub Elite · Real-time intelligence</i>
🔗 https://www.signalrelayhub.io/traders-circle`;
}

export async function POST(req: Request) {
  const secret = process.env.PROVISION_WEBHOOK_SECRET;
  if (secret && req.headers.get('x-provision-secret') !== secret) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const supabase = getServiceClient();
  const now = new Date();
  const fifteenMinsAgo = new Date(now.getTime() - 15 * 60 * 1000).toISOString();
  const fiveMinsAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();

  // Find high impact events that just got their actual value in last 5-15 mins
  const { data: events } = await supabase
    .from('sf_events')
    .select('id, title, currency, impact, forecast, previous_value, actual_value, published')
    .eq('company', 'Forex Factory')
    .in('impact', ['High', 'Medium'])
    .not('actual_value', 'is', null)
    .gte('fetched_at', fifteenMinsAgo)
    .lte('fetched_at', fiveMinsAgo)
    .order('fetched_at', { ascending: false });

  if (!events || events.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, message: 'No new event results in window' });
  }

  const { data: eliteProfiles } = await supabase
    .from('profiles')
    .select('telegram_chat_id')
    .eq('is_elite', true)
    .not('telegram_chat_id', 'is', null);

  if (!eliteProfiles || eliteProfiles.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, message: 'No Elite subscribers with Telegram' });
  }

  const prices = await fetchCurrentPrices();
  let sent = 0;

  for (const event of events) {
    try {
      const debrief = await generatePostEventDebrief(event, prices);
      const message = formatDebriefMessage(event, debrief);

      for (const profile of eliteProfiles) {
        if (!profile.telegram_chat_id) continue;
        await sendTelegramMessage(profile.telegram_chat_id, message);
        sent++;
      }
    } catch { continue; }
  }

  return NextResponse.json({ ok: true, sent, events_debriefed: events.length });
}
