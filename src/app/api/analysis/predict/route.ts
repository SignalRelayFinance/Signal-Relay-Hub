/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function fetchLivePrices(): Promise<Record<string, number>> {
  const prices: Record<string, number> = {};
  try {
    const apiKey = process.env.TWELVE_DATA_API_KEY;
    if (!apiKey) return prices;

    const symbols: Record<string, string> = {
      XAUUSD: 'XAU/USD',
      BTCUSD: 'BTC/USD',
      EURUSD: 'EUR/USD',
      GBPUSD: 'GBP/USD',
      USOIL: 'WTI/USD',
      US30: 'US30/USD',
    };

    const symbolList = Object.values(symbols).join(',');
    const res = await fetch(
      `https://api.twelvedata.com/price?symbol=${encodeURIComponent(symbolList)}&apikey=${apiKey}`
    );
    const data = await res.json();

    for (const [key, symbol] of Object.entries(symbols)) {
      const price = data[symbol]?.price;
      if (price) prices[key] = parseFloat(price);
    }
  } catch {
    // ignore
  }
  return prices;
}

function formatPrices(prices: Record<string, number>): string {
  if (Object.keys(prices).length === 0) return 'Live prices unavailable — use current market prices';
  return Object.entries(prices)
    .map(([pair, price]) => `${pair}: ${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 5 })}`)
    .join('\n');
}

export async function POST(req: Request) {
  const secret = process.env.PROVISION_WEBHOOK_SECRET;
  if (secret && req.headers.get('x-provision-secret') !== secret) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const supabase = getServiceClient();

  const { data: events } = await supabase
    .from('sf_events')
    .select('id, title, summary, company, primary_tag, impact_score, sentiment, pairs_analysis')
    .gte('impact_score', 3)
    .is('trade_prediction', null)
    .not('pairs_analysis', 'is', null)
    .order('fetched_at', { ascending: false })
    .limit(10);

  if (!events || events.length === 0) {
    return NextResponse.json({ ok: true, predicted: 0 });
  }

  // Fetch live prices once for all predictions
  const livePrices = await fetchLivePrices();
  const pricesContext = formatPrices(livePrices);

  let predicted = 0;

  for (const event of events) {
    try {
      const pairsContext = event.pairs_analysis?.pairs
        ?.map((p: any) => `${p.pair}: ${p.direction} (strength ${p.strength}) — ${p.reason}`)
        .join('\n') ?? 'No pairs analysis available';

     // Count corroborating signals — same sentiment from other sources in last 24h
      const { data: corroborating } = await supabase
        .from('sf_events')
        .select('id, sentiment, pairs_analysis')
        .neq('id', event.id)
        .eq('sentiment', event.sentiment ?? 'neutral')
        .gte('fetched_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .not('pairs_analysis', 'is', null);

      const corroboratingCount = corroborating?.length ?? 0;
      const confidenceBoost = Math.min(corroboratingCount * 8, 30);
      const baseConfidence = event.impact_score >= 4 ? 55 : 45;
      const confidenceScore = Math.min(baseConfidence + confidenceBoost, 92);

      const prompt = `You are a senior forex and crypto trading analyst with 15 years of experience. A high-impact market signal has just dropped. Generate a professional trade prediction using CURRENT live market prices.

CRITICAL GUARDRAIL: You MUST base your entry_zone, target, and stop_loss EXACTLY around the current live market prices provided below. If you suggest a trade for a pair, the prices MUST reflect this live data. Do NOT use historical data.

--- CURRENT LIVE PRICES ---
${pricesContext}
---------------------------

SIGNAL:
Company: ${event.company}
Category: ${event.primary_tag}
Title: ${event.title}
Summary: ${event.summary ?? 'N/A'}

MARKET IMPACT ANALYSIS:
${pairsContext}

Respond ONLY with valid JSON, no markdown, exactly in this structure:
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
  "do_not_trade": "Any pairs to avoid trading right now and why — one sentence",
  "confidence_score": ${confidenceScore},
  "corroborating_signals": ${corroboratingCount}
}

Maximum 3 trades. Only include high conviction setups.`;

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

      // Inject confidence score into prediction
      prediction.confidence_score = confidenceScore;
      prediction.corroborating_signals = corroboratingCount;

      await supabase
        .from('sf_events')
        .update({ trade_prediction: prediction })
        .eq('id', event.id);

      predicted++;
    } catch {
      continue;
    }
  }

  return NextResponse.json({ ok: true, predicted, prices_used: livePrices });
}
