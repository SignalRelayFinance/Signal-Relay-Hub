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
}) {
  if (!input.email) throw new Error('No email in checkout session');

  const supabase = getServiceClient();
  const apiKey = generateApiKey();

  const { error } = await supabase
    .from('profiles')
    .upsert(
      {
        email: input.email,
        stripe_customer_id: input.stripeCustomerId ?? null,
        stripe_session_id: input.stripeSessionId,
        api_key: apiKey,
        is_subscribed: true,
      },
      { onConflict: 'email' }
    );

  if (error) throw new Error(`Supabase upsert failed: ${error.message}`);

  return { apiKey };
}
