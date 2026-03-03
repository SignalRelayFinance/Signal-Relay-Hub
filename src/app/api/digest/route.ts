import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    digests: [
      {
        id: 'dig_demo_1',
        ts: new Date().toISOString(),
        title: 'Demo Digest',
        summary: 'Once the collectors are wired, this will show real digests.',
        highlights: ['Wire /api/digest', 'Add persistence', 'Send email digests'],
      },
    ],
  });
}
