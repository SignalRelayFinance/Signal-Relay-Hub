/* eslint-disable @typescript-eslint/no-explicit-any */
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
    return NextResponse.json({ error: 'Missing STRIPE_WEBHOOK_SECRET' }, { status: 500 });
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

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;

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
        isElite: session.amount_total ? session.amount_total >= 15000 : false,
      }),
    });
  }

  // Handle subscription renewal/update — update expiry date
  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.created') {
    const subscription = event.data.object as any;
    const customerId = subscription.customer;
    const periodEnd = subscription.current_period_end;

    if (customerId && periodEnd) {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      await supabase
        .from('profiles')
        .update({ subscription_end_at: new Date(periodEnd * 1000).toISOString() })
        .eq('stripe_customer_id', customerId);
    }
  }

  return NextResponse.json({ received: true });
}
