import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'missing',
    service_role: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'set' : 'missing',
  });
}
