import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getStripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let stripe;
  try {
    stripe = getStripe();
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: 'Missing STRIPE_WEBHOOK_SECRET (webhook verification disabled)' },
      { status: 500 },
    );
  }

  const sig = (await headers()).get('stripe-signature');
  if (!sig) return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 });

  const raw = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, webhookSecret);
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature', detail: String(err) }, { status: 400 });
  }

  // MVP: on successful checkout, call our provision webhook.
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as {
      id: string;
      customer?: string | null;
      customer_details?: { email?: string | null };
    };

    const provisionSecret = process.env.PROVISION_WEBHOOK_SECRET;
    await fetch(new URL('/api/webhooks/provision', req.url), {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(provisionSecret ? { 'x-provision-secret': provisionSecret } : {}),
      },
      body: JSON.stringify({
        stripeSessionId: session.id,
        stripeCustomerId: session.customer ?? null,
        email: session.customer_details?.email ?? null,
      }),
    });
  }

  return NextResponse.json({ received: true });
}
