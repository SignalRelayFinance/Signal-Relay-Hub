/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function fetchCurrentPrice(pair: string): Promise<number | null> {
  const urlMap: Record<string, string> = {
    XAUUSD: 'https://query1.finance.yahoo.com/v8/finance/chart/GC=F?interval=1d&range=1d',
    BTCUSD: 'https://query1.finance.yahoo.com/v8/finance/chart/BTC-USD?interval=1d&range=1d',
    EURUSD: 'https://query1.finance.yahoo.com/v8/finance/chart/EURUSD=X?interval=1d&range=1d',
    GBPUSD: 'https://query1.finance.yahoo.com/v8/finance/chart/GBPUSD=X?interval=1d&range=1d',
    USOIL: 'https://query1.finance.yahoo.com/v8/finance/chart/CL=F?interval=1d&range=1d',
    US30: 'https://query1.finance.yahoo.com/v8/finance/chart/%5EDJI?interval=1d&range=1d',
    ETHUSD: 'https://query1.finance.yahoo.com/v8/finance/chart/ETH-USD?interval=1d&range=1d',
  };
  try {
    const url = urlMap[pair];
    if (!url) return null;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const data = await res.json();
    return data?.chart?.result?.[0]?.meta?.regularMarketPrice ?? null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_elite')
    .eq('email', user.email)
    .single();

  if (!profile?.is_elite) {
    return NextResponse.json({ error: 'Elite subscription required' }, { status: 403 });
  }

  const { messages, pair } = await req.json();
  const currentPrice = await fetchCurrentPrice(pair);
  const priceContext = currentPrice
    ? `Current live price of ${pair}: ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 5 })}`
    : `Live price for ${pair} unavailable — use your platform for current price`;

  const systemPrompt = `You are an elite professional trading analyst with 15 years of experience in forex, crypto, metals and commodities markets. You work for Signal Relay Hub, a premium market intelligence platform.

${priceContext}

Your role is to provide professional, data-driven market analysis and trade recommendations. Always:
- Use the current live price provided above for any price levels you mention
- Be specific with price levels — give exact numbers not vague ranges
- Structure responses clearly with sections when doing full analysis
- Include risk warnings where appropriate
- Be concise but comprehensive
- Format with clear headings and bullet points for readability
- Never give financial advice — frame as analysis and education

When generating trade setups always include: direction, entry zone, target, stop loss, risk/reward ratio, timeframe and thesis.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      system: systemPrompt,
      messages: messages.slice(-10),
    }),
  });

  const data = await response.json();
  const text = data.content?.[0]?.text ?? 'Sorry, I could not generate a response. Please try again.';

  return NextResponse.json({ response: text });
}
