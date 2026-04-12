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

  // Get recent high-impact events without pairs analysis
  // Get recent high-impact events without pairs analysis
  const { data: events, error: queryError } = await supabase
    .from('sf_events')
    .select('id, title, summary, company, primary_tag, impact_score')
    .gte('impact_score', 1)
    .is('pairs_analysis', null)
    .order('fetched_at', { ascending: false })
    .limit(20);

  if (queryError) {
    return NextResponse.json({ ok: false, error: queryError.message });
  }

  if (!events || events.length === 0) {
    return NextResponse.json({ ok: true, analysed: 0, debug: 'no events found matching query' });
  }

  let analysed = 0;

  for (const event of events) {
    try {
      const prompt = `You are a professional forex and crypto market analyst.

Analyse this financial/market news signal and predict the likely short-term directional impact on these trading pairs: ${PAIRS.join(', ')}.

Signal:
Company: ${event.company}
Category: ${event.primary_tag}
Title: ${event.title}
Summary: ${event.summary ?? 'N/A'}

Respond ONLY with a valid JSON object, no markdown, no explanation, exactly this structure:
{
  "pairs": [
    {
      "pair": "EURUSD",
      "direction": "bullish" | "bearish" | "neutral",
      "strength": 1 | 2 | 3,
      "reason": "one sentence max"
    }
  ],
  "overall": "one sentence summary of market impact"
}

strength: 1=weak, 2=moderate, 3=strong. Only include pairs meaningfully affected, skip neutral ones unless all are neutral.`;

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
      const text = data.content?.[0]?.text ?? '';

      let analysis;
      try {
        analysis = JSON.parse(text.replace(/```json|```/g, '').trim());
      } catch {
        continue;
      }

      await supabase
        .from('sf_events')
        .update({ pairs_analysis: analysis })
        .eq('id', event.id);

      analysed++;
    } catch {
      continue;
    }
  }

  return NextResponse.json({ ok: true, analysed, total_found: events.length });
}
