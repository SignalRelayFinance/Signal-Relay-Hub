import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'missing',
    service_role: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'set' : 'missing',
    url_value: process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 30),
  });
}
