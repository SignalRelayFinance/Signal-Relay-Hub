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
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  });
}

async function fetchCurrentPrices(): Promise<Record<string, number>> {
  const prices: Record<string, number> = {};
  try {
    const apiKey = process.env.TWELVE_DATA_API_KEY;
    if (!apiKey) return prices;
    const symbols = 'XAU/USD,BTC/USD,EUR/USD,GBP/USD,WTI/USD';
    const res = await fetch(
      `https://api.twelvedata.com/price?symbol=${encodeURIComponent(symbols)}&apikey=${apiKey}`
    );
    const data = await res.json();
    const map: Record<string, string> = {
      'XAU/USD': 'XAUUSD',
      'BTC/USD': 'BTCUSD',
      'EUR/USD': 'EURUSD',
      'GBP/USD': 'GBPUSD',
      'WTI/USD': 'USOIL',
    };
    for (const [symbol, key] of Object.entries(map)) {
      const price = data[symbol]?.price;
      if (price) prices[key] = parseFloat(price);
    }
  } catch { /* ignore */ }
  return prices;
}

async function generatePreEventAnalysis(
  event: any,
  recentSignals: any[],
  prices: Record<string, number>
): Promise<string> {
  const pricesText = Object.entries(prices)
    .map(([k, v]) => `${k}: ${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 5 })}`)
    .join(', ');

  const signalsContext = recentSignals.length > 0
    ? recentSignals.map(s => `- ${s.company}: ${s.title} (${s.sentiment}, impact ${s.impact_score})`).join('\n')
    : 'No recent signals available';

  const prompt = `You are a professional macro economist and trading analyst. An important economic event is dropping in 15 minutes. Provide a factual pre-event analysis.

UPCOMING EVENT:
Title: ${event.title}
Currency: ${event.currency ?? 'N/A'}
Impact: ${event.impact ?? 'High'}
Forecast: ${event.forecast ?? 'N/A'}
Previous: ${event.previous_value ?? 'N/A'}

CURRENT LIVE MARKET PRICES:
${pricesText}

RECENT MARKET SIGNALS (last 24h):
${signalsContext}

Provide a concise pre-event analysis in this exact format:

OUTLOOK: [one sentence — likely beat/miss/inline based on economic conditions]

MARKET IMPACT:
- [pair 1]: [direction and reason if beat] / [direction if miss]
- [pair 2]: [direction and reason if beat] / [direction if miss]
- [pair 3]: [direction and reason if beat] / [direction if miss]

KEY LEVEL TO WATCH:
- [pair]: [specific price level] — [why it matters]

RISK: [one sentence on what could surprise markets]

Be factual and concise. Base analysis on real economic relationships. Do not speculate beyond established macro connections. Max 150 words total.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await response.json();
  return data.content?.[0]?.text ?? 'Analysis unavailable';
}

function formatPreEventMessage(event: any, analysis: string): string {
  const impactEmoji = event.impact === 'High' ? '🔴' : event.impact === 'Medium' ? '🟡' : '🟢';
  const timeStr = event.published_at
    ? new Date(event.published_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
    : 'Soon';

  return `${impactEmoji} <b>ELITE PRE-EVENT ALERT — 15 MIN WARNING</b>

<b>${event.title}</b>
🕐 Drops at: ${timeStr} UTC
💱 Currency: ${event.currency ?? 'N/A'}
📊 Forecast: ${event.forecast ?? 'N/A'} | Previous: ${event.previous_value ?? 'N/A'}

🤖 <b>AI Pre-Event Analysis:</b>
${analysis}

─────────────
<i>Signal Relay Hub Elite · Real-time intelligence</i>
🔗 https://www.signalrelayhub.io/ai-assistant`;
}

export async function POST(req: Request) {
  const secret = process.env.PROVISION_WEBHOOK_SECRET;
  if (secret && req.headers.get('x-provision-secret') !== secret) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const supabase = getServiceClient();
  const now = new Date();
  const in15 = new Date(now.getTime() + 15 * 60 * 1000);
  const in20 = new Date(now.getTime() + 20 * 60 * 1000);

  // Find high impact Forex Factory events dropping in next 15-20 minutes
  const { data: upcomingEvents } = await supabase
    .from('sf_events')
    .select('id, title, currency, impact, forecast, previous_value, actual_value, published')
    .eq('company', 'Forex Factory')
    .in('impact', ['High', 'Medium'])
    .is('actual_value', null)
    .gte('published', in15.toISOString())
    .lte('published', in20.toISOString())
    .order('published', { ascending: true });

  if (!upcomingEvents || upcomingEvents.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, message: 'No upcoming events in 15-20 min window' });
  }

  // Get recent signals for context
  const { data: recentSignals } = await supabase
    .from('sf_events')
    .select('company, title, sentiment, impact_score, primary_tag')
    .neq('company', 'Forex Factory')
    .gte('fetched_at', new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString())
    .gte('impact_score', 3)
    .order('impact_score', { ascending: false })
    .limit(5);

  // Get Elite subscribers
  const { data: eliteProfiles } = await supabase
    .from('profiles')
    .select('telegram_chat_id')
    .eq('is_elite', true)
    .not('telegram_chat_id', 'is', null);

  if (!eliteProfiles || eliteProfiles.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, message: 'No Elite subscribers with Telegram connected' });
  }

  // Fetch live prices once
  const prices = await fetchCurrentPrices();

  let sent = 0;

  for (const event of upcomingEvents) {
    try {
      const analysis = await generatePreEventAnalysis(event, recentSignals ?? [], prices);
      const message = formatPreEventMessage(event, analysis);

      for (const profile of eliteProfiles) {
        if (!profile.telegram_chat_id) continue;
        await sendTelegramMessage(profile.telegram_chat_id, message);
        sent++;
      }
    } catch {
      continue;
    }
  }

  return NextResponse.json({ ok: true, sent, events_found: upcomingEvents.length });
}
