import { NextResponse } from 'next/server';
import { provisionForCheckoutSession } from '@/lib/provision';

export async function POST(req: Request) {
  const secret = process.env.PROVISION_WEBHOOK_SECRET;
  if (secret) {
    const got = req.headers.get('x-provision-secret');
    if (got !== secret) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as {
    email?: string | null;
    stripeCustomerId?: string | null;
    stripeSessionId?: string;
    isElite?: boolean;
  } | null;

  if (!body?.stripeSessionId) {
    return NextResponse.json({ error: 'missing stripeSessionId' }, { status: 400 });
  }

  const out = await provisionForCheckoutSession({
    email: body.email,
    stripeCustomerId: body.stripeCustomerId,
    stripeSessionId: body.stripeSessionId,
    isElite: body.isElite ?? false,
  });

  return NextResponse.json({ ok: true, ...out });
}
