import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const protectedPrefixes = ['/feed', '/digests', '/drip-queue', '/settings'];

export async function middleware(request: NextRequest) {
  const res = await updateSession(request);

  const url = request.nextUrl;
  const isProtected = protectedPrefixes.some((p) => url.pathname.startsWith(p));

  if (!isProtected) return res;

  // If supabase cookies are present, allow.
  // If Supabase isn't configured, allow (MVP dev convenience).
  const supabaseConfigured =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseConfigured) return res;

  const hasAuthCookie =
    request.cookies.getAll().some((c) => c.name.startsWith('sb-')) ||
    request.cookies.getAll().some((c) => c.name.includes('supabase'));

  if (hasAuthCookie) return res;

  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('redirect', url.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/feed/:path*', '/digests/:path*', '/drip-queue/:path*', '/settings/:path*'],
};
