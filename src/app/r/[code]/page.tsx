import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

export default async function ReferralPage({ params }: { params: { code: string } }) {
  const code = params.code;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Find who owns this referral code
  const { data: referrer } = await supabase
    .from('profiles')
    .select('email, referral_code')
    .eq('referral_code', code)
    .single();

  if (referrer) {
    // Store referral code in cookie via redirect to pricing
    redirect(`/pricing?ref=${code}`);
  }

  // Invalid code — just redirect to pricing
  redirect('/pricing');
}
