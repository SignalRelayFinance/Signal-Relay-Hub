import { NextRequest, NextResponse } from 'next/server';
import { fetchEvents } from '@/lib/signal-store';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limitParam = searchParams.get('limit');
  const limit = limitParam ? Math.min(parseInt(limitParam, 10) || 50, 200) : 50;
  const since = searchParams.get('since') ?? undefined;
  const tag = searchParams.get('tag') ?? undefined;

  const payload = await fetchEvents({ limit, since, tag });

  return NextResponse.json(payload);
}
