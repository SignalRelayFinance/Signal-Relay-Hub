import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    highlights: ['Demo highlight — replace via backend wiring'],
  });
}
