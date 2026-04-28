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

async function sendToPublicTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: '@signalrelayhub', text, parse_mode: 'HTML', disable_web_page_preview: true }),
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

async function generateWeeklyOutlook(
  signals: any[],
  calendarEvents: any[],
  prices: Record<string, number>
): Promise<string> {
  const pricesText = Object.entries(prices)
    .map(([k, v]) => `${k}: ${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 5 })}`)
    .join('\n');

  const signalsText = signals.map((s, i) =>
    `${i + 1}. [${s.company}] ${s.title} — ${s.sentiment}, Impact ${s.impact_score}/5`
  ).join('\n');

  const calendarText = calendarEvents.length > 0
    ? calendarEvents.map(e =>
        `• ${e.title} (${e.currency ?? ''}) — Forecast: ${e.forecast ?? 'N/A'}`
      ).join('\n')
    : 'No major scheduled events found';

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() + 1);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const weekLabel = `${weekStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })} – ${weekEnd.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`;

  const prompt = `You are a senior macro strategist writing the weekly trading outlook for elite professional traders. This is the week of ${weekLabel}. Write a professional, data-driven weekly outlook.

CURRENT LIVE PRICES:
${pricesText}

TOP SIGNALS FROM THIS WEEK:
${signalsText}

UPCOMING ECONOMIC CALENDAR (next 7 days):
${calendarText}

Write a comprehensive weekly outlook in this exact format:

MACRO OVERVIEW
Two sentences on the dominant macro theme driving markets this week.

PAIR OUTLOOKS
For each pair provide bias and key levels:
- XAUUSD: [Bullish/Bearish/Ranging] — Key levels: [support] / [resistance]. Watch for [catalyst].
- EURUSD: [Bullish/Bearish/Ranging] — Key levels: [support] / [resistance]. Watch for [catalyst].
- BTCUSD: [Bullish/Bearish/Ranging] — Key levels: [support] / [resistance]. Watch for [catalyst].
- GBPUSD: [Bullish/Bearish/Ranging] — Key levels: [support] / [resistance]. Watch for [catalyst].
- USOIL: [Bullish/Bearish/Ranging] — Key levels: [support] / [resistance]. Watch for [catalyst].

KEY EVENTS THIS WEEK
Top 3 economic events to watch and their expected market impact.

RISK SCENARIOS
- Upside risk: [what could drive risk-on moves]
- Downside risk: [what could drive risk-off moves]

OVERALL WEEKLY BIAS
One clear sentence — risk-on, risk-off, or mixed, and which pairs offer the best setups.

TRADE OF THE WEEK
The single best setup this week — pair, direction, entry zone, target, stop loss, and why.

Be specific with price levels based on current prices above. Professional and concise. Max 500 words.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await response.json();
  return data.content?.[0]?.text ?? 'Weekly outlook unavailable';
}

function markdownToTelegram(text: string): string {
  return text
    .replace(/^## (.+)$/gm, '<b>$1</b>')
    .replace(/^# (.+)$/gm, '<b>$1</b>')
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/\*(.+?)\*/g, '<i>$1</i>');
}

function formatWeeklyMessage(outlook: string, prices: Record<string, number>, isElite: boolean): string {
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() + 1);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const weekLabel = `${weekStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })} – ${weekEnd.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}`;

  const priceLines = Object.entries(prices)
    .map(([k, v]) => `${k}: <b>${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b>`)
    .join(' · ');

  if (isElite) {
    return `⭐ <b>ELITE WEEKLY MACRO OUTLOOK</b>
📅 Week of ${weekLabel}

💹 <b>Current Prices:</b>
${priceLines}

─────────────

${markdownToTelegram(outlook)}

─────────────
🤖 AI macro analysis · Elite subscribers only
🔗 https://www.signalrelayhub.io/ai-assistant`;
  }

  return `📡 <b>Signal Relay Hub — Weekly Outlook</b>
📅 Week of ${weekLabel}

The weekly macro outlook is live for Elite members. Key themes, pair biases, risk scenarios and the trade of the week — all in one report.

💹 ${Object.entries(prices).slice(0, 3).map(([k, v]) => `${k}: ${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`).join(' · ')}

🎯 Full weekly outlook available for Elite members
🔗 https://www.signalrelayhub.io/pricing`;
}

export async function POST(req: Request) {
  const secret = process.env.PROVISION_WEBHOOK_SECRET;
  if (secret && req.headers.get('x-provision-secret') !== secret) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const supabase = getServiceClient();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const sevenDaysAhead = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  // Get top signals from the past week
  const { data: signals } = await supabase
    .from('sf_events')
    .select('title, company, primary_tag, impact_score, sentiment')
    .neq('company', 'Forex Factory')
    .gte('fetched_at', sevenDaysAgo)
    .gte('impact_score', 3)
    .order('impact_score', { ascending: false })
    .limit(10);

  // Get upcoming economic calendar events for the week ahead
  const { data: calendarEvents } = await supabase
    .from('sf_events')
    .select('title, currency, impact, forecast, previous_value')
    .eq('company', 'Forex Factory')
    .in('impact', ['High', 'Medium'])
    .gte('published', new Date().toISOString())
    .lte('published', sevenDaysAhead)
    .order('published', { ascending: true })
    .limit(10);

  if (!signals || signals.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, message: 'No signals found for weekly outlook' });
  }

  const prices = await fetchCurrentPrices();
  const outlook = await generateWeeklyOutlook(signals, calendarEvents ?? [], prices);

  // Send full outlook to Elite subscribers
  const { data: eliteProfiles } = await supabase
    .from('profiles')
    .select('telegram_chat_id')
    .eq('is_elite', true)
    .not('telegram_chat_id', 'is', null);

  let sent = 0;

  if (eliteProfiles) {
    const eliteMessage = formatWeeklyMessage(outlook, prices, true);
    for (const profile of eliteProfiles) {
      if (!profile.telegram_chat_id) continue;
      await sendTelegramMessage(profile.telegram_chat_id, eliteMessage);
      sent++;
    }
  }

  // Send teaser to public channel
  await sendToPublicTelegram(formatWeeklyMessage(outlook, prices, false));

  // Send teaser to Pro subscribers
  const { data: proProfiles } = await supabase
    .from('profiles')
    .select('telegram_chat_id')
    .eq('is_subscribed', true)
    .eq('is_elite', false)
    .not('telegram_chat_id', 'is', null);

  if (proProfiles) {
    const proMessage = formatWeeklyMessage(outlook, prices, false);
    for (const profile of proProfiles) {
      if (!profile.telegram_chat_id) continue;
      await sendTelegramMessage(profile.telegram_chat_id, proMessage);
      sent++;
    }
  }

  return NextResponse.json({ ok: true, sent, signals_used: signals.length });
}
