import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    events: [
      {
        id: 'evt_demo_1',
        ts: new Date().toISOString(),
        type: 'demo',
        title: 'Demo event (wire backend to replace this)',
        body: { note: 'Implement this endpoint or set NEXT_PUBLIC_SIGNAL_API_BASE_URL.' },
      },
    ],
  });
}
