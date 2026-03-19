import { NextRequest, NextResponse } from 'next/server';
import { fetchDigest } from '@/lib/signal-store';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date') ?? undefined;

  const digest = await fetchDigest(date);
  return NextResponse.json(digest);
}
