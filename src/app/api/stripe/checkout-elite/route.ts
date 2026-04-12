import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  let stripe;
  try {
    stripe = getStripe();
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }

  const priceId = process.env.STRIPE_ELITE_PRICE_ID;
  if (!priceId) {
    return NextResponse.json({ error: 'Missing STRIPE_ELITE_PRICE_ID' }, { status: 500 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/settings?checkout=success`,
    cancel_url: `${appUrl}/pricing?checkout=cancel`,
  });

  if (!session.url) {
    return NextResponse.json({ error: 'No checkout URL returned' }, { status: 500 });
  }

  return NextResponse.redirect(session.url);
}
