import { NextRequest, NextResponse } from 'next/server';
import { fetchHighlights } from '@/lib/signal-store';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limitParam = searchParams.get('limit');
  const limit = limitParam ? Math.min(parseInt(limitParam, 10) || 5, 25) : 5;
  const minScoreParam = searchParams.get('min_score');
  const minScore = minScoreParam ? parseFloat(minScoreParam) : undefined;

  const highlights = await fetchHighlights({ limit, minScore });

  return NextResponse.json({ highlights });
}
