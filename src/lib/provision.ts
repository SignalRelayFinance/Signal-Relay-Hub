import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env vars');
  return createClient(url, key);
}

function generateApiKey(): string {
  return 'srh_live_' + crypto.randomBytes(20).toString('hex');
}

export async function provisionForCheckoutSession(input: {
  email?: string | null;
  stripeCustomerId?: string | null;
  stripeSessionId: string;
  isElite?: boolean;
}) {
  if (!input.email) throw new Error('No email in checkout session');
  const supabase = getServiceClient();
  const apiKey = generateApiKey();

  // Set subscription end date to 1 month from now on first provision
  const subscriptionEndAt = new Date();
  subscriptionEndAt.setMonth(subscriptionEndAt.getMonth() + 1);

  const updateData: Record<string, unknown> = {
    email: input.email,
    stripe_customer_id: input.stripeCustomerId ?? null,
    stripe_session_id: input.stripeSessionId,
    api_key: apiKey,
    is_subscribed: true,
    subscription_end_at: subscriptionEndAt.toISOString(),
  };
  if (input.isElite) {
    updateData.is_elite = true;
  }

  const { error } = await supabase
    .from('profiles')
    .upsert(updateData, { onConflict: 'email' });

  if (error) throw new Error(`Supabase upsert failed: ${error.message}`);
  return { apiKey };
}
