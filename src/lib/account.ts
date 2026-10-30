import type { SupabaseClient } from '@supabase/supabase-js';
import type { AccountState, AccountUser } from '@/types/account';
import { FREE_DAILY_LIMIT, getToday } from './date';
import { getEffectiveSubscription, isProActive } from './subscription';

// Shared by the session endpoint and account SSR. Never cache across users.
export async function getAccountState(
  client: SupabaseClient,
  user: AccountUser,
): Promise<AccountState> {
  const date = getToday();
  const [subscription, creditResult, usageResult] = await Promise.all([
    getEffectiveSubscription(client, user.id),
    client
      .from('credit_packages')
      .select('credits_remaining')
      .eq('user_id', user.id)
      .gt('credits_remaining', 0),
    client
      .from('daily_usage')
      .select('count')
      .eq('user_id', user.id)
      .eq('usage_date', date),
  ]);
  if (creditResult.error) throw creditResult.error;
  if (usageResult.error) throw usageResult.error;
  const credits = (creditResult.data || []).reduce(
    (sum, row) => sum + row.credits_remaining,
    0,
  );
  const used = (usageResult.data || []).reduce(
    (sum, row) => sum + row.count,
    0,
  );
  const freeRemaining = Math.max(0, FREE_DAILY_LIMIT - used);
  const isUnlimited = isProActive(subscription);

  return {
    user: {
      id: user.id,
      ...(user.email ? { email: user.email } : {}),
      ...(user.user_metadata ? { user_metadata: user.user_metadata } : {}),
    },
    subscription,
    credits,
    usage: {
      date,
      remaining: isUnlimited ? -1 : freeRemaining + credits,
      total: isUnlimited ? -1 : FREE_DAILY_LIMIT,
      isUnlimited,
      freeRemaining,
      paidCredits: credits,
      planType: subscription?.plan_type || 'free',
    },
  };
}
