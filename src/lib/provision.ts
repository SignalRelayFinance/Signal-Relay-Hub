export async function provisionForCheckoutSession(input: {
  email?: string | null;
  stripeCustomerId?: string | null;
  stripeSessionId: string;
}) {
  // TODO: create tenant, generate API key, persist to DB (Supabase)
  // For now: return a fake key.
  const suffix = input.stripeSessionId.slice(-8);
  return {
    apiKey: `srh_live_${suffix}`,
  };
}
