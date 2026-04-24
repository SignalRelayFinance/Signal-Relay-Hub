import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function sendTelegramAlert(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.HEALTH_ALERT_CHAT_ID;
  if (!token || !chatId) return;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  });
}

export async function GET(req: Request) {
  const secret = req.headers.get('x-provision-secret');
  if (secret !== process.env.PROVISION_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const supabase = getServiceClient();
  const now = new Date();
  const issues: string[] = [];

  // Check 1 — pipeline ran in last 8 hours
  const eightHoursAgo = new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString();
  const { data: recentEvents } = await supabase
    .from('sf_events')
    .select('id, fetched_at')
    .gte('fetched_at', eightHoursAgo)
    .limit(1);

  if (!recentEvents || recentEvents.length === 0) {
    issues.push('Pipeline has not run in over 8 hours — no new events detected');
  }

  // Check 2 — pairs analysis running
  const { data: unparsed } = await supabase
    .from('sf_events')
    .select('id')
    .is('pairs_analysis', null)
    .gte('impact_score', 3)
    .gte('fetched_at', eightHoursAgo)
    .limit(1);

  if (unparsed && unparsed.length > 0) {
    issues.push('Pairs analysis not running — high impact events missing analysis');
  }

  // Check 3 — Supabase connection healthy
  const { error: dbError } = await supabase
    .from('sf_events')
    .select('id', { count: 'exact', head: true });

  if (dbError) {
    issues.push(`Supabase connection error: ${dbError.message}`);
  }

  // Check 4 — Twelve Data API healthy
  try {
    const apiKey = process.env.TWELVE_DATA_API_KEY;
    if (apiKey) {
      const res = await fetch(
        `https://api.twelvedata.com/price?symbol=EUR/USD&apikey=${apiKey}`
      );
      const data = await res.json();
      if (!data?.price) {
        issues.push('Twelve Data API not returning prices — live price feeds may be down');
      }
    }
  } catch {
    issues.push('Twelve Data API unreachable');
  }

  // Check 5 — Anthropic API healthy
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'ping' }],
      }),
    });
    if (!res.ok) {
      issues.push(`Anthropic API error: ${res.status}`);
    }
  } catch {
    issues.push('Anthropic API unreachable');
  }

  const healthy = issues.length === 0;
  const status = {
    healthy,
    checked_at: now.toISOString(),
    issues,
  };

  // Send Telegram alert if issues found
  if (!healthy) {
    const alertText = `🚨 <b>Signal Relay Hub — Health Alert</b>

${issues.map(i => `⚠️ ${i}`).join('\n')}

🕐 Detected at: ${now.toLocaleString('en-GB', { timeZone: 'UTC' })} UTC
🔗 Check dashboard: https://www.signalrelayhub.io/feed`;

    await sendTelegramAlert(alertText);
  } else {
    // Optional — send OK message once a day
    const hour = now.getUTCHours();
    if (hour === 9) {
      await sendTelegramAlert(`✅ <b>Signal Relay Hub — All Systems Healthy</b>
🕐 ${now.toLocaleString('en-GB', { timeZone: 'UTC' })} UTC
📡 Pipeline running · Supabase connected · APIs healthy`);
    }
  }

  return NextResponse.json(status);
}
