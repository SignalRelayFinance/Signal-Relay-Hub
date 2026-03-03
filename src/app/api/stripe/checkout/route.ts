import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';

export async function GET(req: Request) {
  const stripe = getStripe();

  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) {
    return NextResponse.json({ error: 'Missing STRIPE_PRICE_ID' }, { status: 500 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/settings?checkout=success`,
    cancel_url: `${appUrl}/settings?checkout=cancel`,
  });

  if (!session.url)
    return NextResponse.json({ error: 'No checkout URL returned' }, { status: 500 });
  return NextResponse.redirect(session.url);
}
