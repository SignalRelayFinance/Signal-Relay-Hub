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
      'XAU/USD': 'XAUUSD',
      'BTC/USD': 'BTCUSD',
      'EUR/USD': 'EURUSD',
      'GBP/USD': 'GBPUSD',
      'WTI/USD': 'USOIL',
      'US30/USD': 'US30',
    };
    for (const [symbol, key] of Object.entries(map)) {
      const price = data[symbol]?.price;
      if (price) prices[key] = parseFloat(price);
    }
  } catch { /* ignore */ }
  return prices;
}

async function generateDailyBriefing(
  signals: any[],
  calendarEvents: any[],
  prices: Record<string, number>
): Promise<string> {
  const pricesText = Object.entries(prices)
    .map(([k, v]) => `${k}: ${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 5 })}`)
    .join('\n');

  const signalsText = signals.map((s, i) =>
    `${i + 1}. [${s.company}] ${s.title} — ${s.sentiment} sentiment, Impact ${s.impact_score}/5${s.summary ? `\n   ${s.summary.slice(0, 120)}` : ''}`
  ).join('\n\n');

  const calendarText = calendarEvents.length > 0
    ? calendarEvents.map(e =>
        `• ${e.title} (${e.currency ?? ''} ${e.impact ?? ''}) — Forecast: ${e.forecast ?? 'N/A'} | Previous: ${e.previous_value ?? 'N/A'}`
      ).join('\n')
    : 'No major economic events today';

  const prompt = `You are a professional market analyst writing the daily morning briefing for elite traders. Write a concise, factual, professional briefing based on real signal data.

TODAY'S LIVE MARKET PRICES:
${pricesText}

TOP SIGNALS FROM LAST 24 HOURS:
${signalsText}

TODAY'S ECONOMIC CALENDAR (high/medium impact):
${calendarText}

Write a professional daily briefing in this exact format:

MARKET OVERVIEW
Two sentences on overall market conditions based on the signals and prices above.

TOP 5 SIGNALS TODAY
For each of the top 5 signals provide: signal name, why it matters, and which pairs to watch.

ECONOMIC CALENDAR FOCUS
Which events today matter most and what to expect.

PAIRS TO WATCH
List 3 pairs with brief reason why they are in focus today based on the signals.

OVERALL BIAS
One clear sentence — risk on, risk off, or mixed. Which direction are markets leaning today.

Keep it factual, grounded in the actual signals provided. Professional tone. Max 400 words.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await response.json();
  return data.content?.[0]?.text ?? 'Briefing unavailable';
}

function markdownToTelegram(text: string): string {
  return text
    .replace(/^## (.+)$/gm, '<b>$1</b>')
    .replace(/^# (.+)$/gm, '<b>$1</b>')
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/\*(.+?)\*/g, '<i>$1</i>')
    .replace(/^---+$/gm, '─────────────');
}

function formatBriefingMessage(briefing: string, prices: Record<string, number>, isElite: boolean): string {
  const date = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const priceLines = Object.entries(prices)
    .map(([k, v]) => `${k}: <b>${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b>`)
    .join(' · ');

  const eliteBadge = isElite ? '⭐ <b>ELITE DAILY BRIEFING</b>' : '📡 <b>SIGNAL RELAY HUB — DAILY BRIEFING</b>';

  return `${eliteBadge}
📅 ${date}

💹 <b>Live Prices:</b>
${priceLines}

─────────────

${markdownToTelegram(briefing)}

─────────────
${isElite ? '🤖 AI analysis · Elite subscribers only\n🔗 https://www.signalrelayhub.io/ai-assistant' : '🔗 https://www.signalrelayhub.io\n🎯 Upgrade for full analysis → https://www.signalrelayhub.io/pricing'}`;
}

export async function POST(req: Request) {
  const secret = process.env.PROVISION_WEBHOOK_SECRET;
  if (secret && req.headers.get('x-provision-secret') !== secret) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const supabase = getServiceClient();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const today = new Date();
  const todayStart = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const todayEnd = new Date(today.setHours(23, 59, 59, 999)).toISOString();

  // Get top signals from last 24 hours
  const { data: signals } = await supabase
    .from('sf_events')
    .select('title, company, primary_tag, impact_score, sentiment, summary, link')
    .neq('company', 'Forex Factory')
    .gte('fetched_at', since)
    .gte('impact_score', 3)
    .order('impact_score', { ascending: false })
    .limit(5);

  // Get today's high impact calendar events
  const { data: calendarEvents } = await supabase
    .from('sf_events')
    .select('title, currency, impact, forecast, previous_value, actual_value')
    .eq('company', 'Forex Factory')
    .in('impact', ['High', 'Medium'])
    .gte('published', todayStart)
    .lte('published', todayEnd)
    .order('published', { ascending: true });

  if (!signals || signals.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, message: 'No signals found for briefing' });
  }

  // Fetch live prices
  const prices = await fetchCurrentPrices();

  // Generate briefing
  const briefing = await generateDailyBriefing(signals, calendarEvents ?? [], prices);

  // Elite message — full briefing
  const eliteMessage = formatBriefingMessage(briefing, prices, true);

  // Public message — teaser only
  const publicTeaser = `📡 <b>Signal Relay Hub — Daily Briefing</b>
📅 ${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}

Today's top signals are live. ${signals.length} high-impact signals tracked in the last 24 hours.

💹 ${Object.entries(prices).slice(0, 3).map(([k, v]) => `${k}: ${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`).join(' · ')}

🎯 Full AI briefing available for Elite members
🔗 https://www.signalrelayhub.io/pricing`;

  // Send full briefing to Elite subscribers
  const { data: eliteProfiles } = await supabase
    .from('profiles')
    .select('telegram_chat_id')
    .eq('is_elite', true)
    .not('telegram_chat_id', 'is', null);

  let sent = 0;
  if (eliteProfiles) {
    for (const profile of eliteProfiles) {
      if (!profile.telegram_chat_id) continue;
      await sendTelegramMessage(profile.telegram_chat_id, eliteMessage);
      sent++;
    }
  }

  // Send teaser to public channel
  await sendToPublicTelegram(publicTeaser);

  // Send teaser to Pro subscribers
  const { data: proProfiles } = await supabase
    .from('profiles')
    .select('telegram_chat_id')
    .eq('is_subscribed', true)
    .eq('is_elite', false)
    .not('telegram_chat_id', 'is', null);

  if (proProfiles) {
    for (const profile of proProfiles) {
      if (!profile.telegram_chat_id) continue;
      await sendTelegramMessage(profile.telegram_chat_id, publicTeaser);
      sent++;
    }
  }

  return NextResponse.json({ ok: true, sent, signals_used: signals.length });
}
