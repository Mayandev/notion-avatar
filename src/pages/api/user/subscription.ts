import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = createClient(req, res);

    // Get current session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = session.user.id;

    // Fetch subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Fetch remaining credits
    const { data: creditData } = await supabase
      .from('credit_packages')
      .select('credits_remaining')
      .eq('user_id', userId)
      .gt('credits_remaining', 0);

    const totalCredits =
      creditData?.reduce((sum, pkg) => sum + pkg.credits_remaining, 0) || 0;

    return res.status(200).json({
      subscription: subscription || null,
      credits: totalCredits,
    });
  } catch (error) {
    console.error('Subscription error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
