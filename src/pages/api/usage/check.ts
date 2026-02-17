import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getWeekStart, FREE_WEEKLY_LIMIT } from '@/lib/date';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = createClient(req, res);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // Return default free tier for unauthenticated users
      return res.status(200).json({
        remaining: 0,
        total: FREE_WEEKLY_LIMIT,
        isUnlimited: false,
        isAuthenticated: false,
      });
    }

    // Check subscription status
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Check if subscription has expired
    let isSubscriptionActive = false;
    if (
      subscription?.plan_type === 'monthly' &&
      subscription?.status === 'active'
    ) {
      // If current_period_end is null, consider subscription as active
      if (!subscription.current_period_end) {
        isSubscriptionActive = true;
      } else {
        const periodEnd = new Date(subscription.current_period_end);
        const now = new Date();
        isSubscriptionActive = periodEnd >= now;

        // If subscription has expired, update it
        if (!isSubscriptionActive) {
          await supabase
            .from('subscriptions')
            .update({
              status: 'canceled',
              plan_type: 'free',
            })
            .eq('user_id', user.id);
        }
      }
    }

    // If user has active paid subscription, they have unlimited usage
    if (isSubscriptionActive) {
      return res.status(200).json({
        remaining: -1, // -1 indicates unlimited
        total: -1,
        isUnlimited: true,
        isAuthenticated: true,
        planType: 'monthly',
      });
    }

    // Check credit packages
    const { data: credits } = await supabase
      .from('credit_packages')
      .select('credits_remaining')
      .eq('user_id', user.id)
      .gt('credits_remaining', 0);

    const totalCredits =
      credits?.reduce((sum, pkg) => sum + pkg.credits_remaining, 0) || 0;

    // Check weekly usage
    const today = new Date().toISOString().split('T')[0];
    const weekStart = getWeekStart();
    const { data: weeklyUsage } = await supabase
      .from('daily_usage')
      .select('count')
      .eq('user_id', user.id)
      .gte('usage_date', weekStart)
      .lte('usage_date', today);

    const usedThisWeek =
      weeklyUsage?.reduce((sum, r) => sum + (r.count || 0), 0) || 0;
    const freeRemaining = Math.max(0, FREE_WEEKLY_LIMIT - usedThisWeek);

    return res.status(200).json({
      remaining: freeRemaining + totalCredits,
      freeRemaining,
      paidCredits: totalCredits,
      total: FREE_WEEKLY_LIMIT,
      isUnlimited: false,
      isAuthenticated: true,
      planType: subscription?.plan_type || 'free',
    });
  } catch (error) {
    console.error('Usage check error:', error);
    return res.status(500).json({ error: 'Failed to check usage' });
  }
}
