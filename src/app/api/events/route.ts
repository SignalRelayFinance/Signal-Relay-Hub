import { NextRequest, NextResponse } from 'next/server';
import { fetchEvents } from '@/lib/signal-store';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limitParam = searchParams.get('limit');
  const offsetParam = searchParams.get('offset');
  const limit = limitParam ? Math.min(parseInt(limitParam, 10) || 25, 500) : 25;
  const offset = offsetParam ? parseInt(offsetParam, 10) || 0 : 0;
  const since = searchParams.get('since') ?? undefined;
  const tag = searchParams.get('tag') ?? undefined;
  const date = searchParams.get('date') ?? undefined;

  const payload = await fetchEvents({ limit, offset, since, tag, date });
  return NextResponse.json(payload);
}
