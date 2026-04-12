import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const PAIRS = ['EURUSD', 'XAUUSD', 'BTCUSD', 'US30', 'GBPUSD', 'USOIL'];

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: Request) {
  const secret = process.env.PROVISION_WEBHOOK_SECRET;
  if (secret && req.headers.get('x-provision-secret') !== secret) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const supabase = getServiceClient();

  // Only analyse high impact events without predictions yet
  const { data: events } = await supabase
    .from('sf_events')
    .select('id, title, summary, company, primary_tag, impact_score, pairs_analysis')
    .gte('impact_score', 3)
    .is('trade_prediction', null)
    .not('pairs_analysis', 'is', null)
    .order('fetched_at', { ascending: false })
    .limit(10);

  if (!events || events.length === 0) {
    return NextResponse.json({ ok: true, predicted: 0 });
  }

  let predicted = 0;

  for (const event of events) {
    try {
      const pairsContext = event.pairs_analysis?.pairs
        ?.map((p: any) => `${p.pair}: ${p.direction} (strength ${p.strength}) — ${p.reason}`)
        .join('\n') ?? 'No pairs analysis available';

      const prompt = `You are a senior forex and crypto trading analyst with 15 years of experience. A high-impact market signal has just dropped. Generate a professional trade prediction.

SIGNAL:
Company: ${event.company}
Category: ${event.primary_tag}
Title: ${event.title}
Summary: ${event.summary ?? 'N/A'}

MARKET IMPACT ANALYSIS:
${pairsContext}

Generate trade predictions for the most affected pairs. Be specific and actionable.

Respond ONLY with valid JSON, no markdown, exactly this structure:
{
  "trades": [
    {
      "pair": "EURUSD",
      "direction": "long" | "short",
      "conviction": "high" | "medium" | "low",
      "entry_zone": "1.0820 - 1.0840",
      "target": "1.0920",
      "stop_loss": "1.0780",
      "timeframe": "4-12 hours",
      "thesis": "Two to three sentence explanation of why this trade makes sense given the signal",
      "key_risks": "One sentence describing the main risk to this trade"
    }
  ],
  "market_summary": "Two to three sentence overall market context and what traders should watch",
  "do_not_trade": "Any pairs to avoid trading right now and why — one sentence"
}

Only include pairs where there is a clear directional bias. Maximum 3 trades. Be conservative — only high conviction setups.`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY!,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      const data = await response.json();
      const text = data.content?.[0]?.text ?? '';

      let prediction;
      try {
        prediction = JSON.parse(text.replace(/```json|```/g, '').trim());
      } catch {
        continue;
      }

      await supabase
        .from('sf_events')
        .update({ trade_prediction: prediction })
        .eq('id', event.id);

      predicted++;
    } catch {
      continue;
    }
  }

  return NextResponse.json({ ok: true, predicted });
}
