import type { SupabaseClient } from '@supabase/supabase-js';

export interface SubscriptionRow {
  id?: string;
  user_id?: string;
  stripe_subscription_id?: string | null;
  status?: string | null;
  plan_type?: string | null;
  current_period_start?: string | null;
  current_period_end?: string | null;
  cancel_at_period_end?: boolean | null;
}

/**
 * Pure entitlement check. Treat a user as Pro iff:
 *   - plan_type is 'monthly' or 'yearly'
 *   - status is 'active'
 *   - current_period_end is set and still in the future
 *
 * A missing current_period_end means the Stripe webhook failed to record
 * billing dates (was a real bug pre-2026-04 on Stripe API >= 2025-05-28).
 * We fail-safe to NOT Pro so an expired user can never silently keep
 * unlimited access while we wait for a webhook that may never arrive.
 */
export function isProActive(
  sub:
    | Pick<SubscriptionRow, 'plan_type' | 'status' | 'current_period_end'>
    | null
    | undefined,
  now: Date = new Date(),
): boolean {
  if (!sub) return false;
  if (sub.plan_type !== 'monthly' && sub.plan_type !== 'yearly') return false;
  if (sub.status !== 'active') return false;
  if (!sub.current_period_end) return false;
  return new Date(sub.current_period_end) >= now;
}

/**
 * Fetch a user's subscription row and opportunistically downgrade it to
 * free/canceled if its billing period has elapsed but the row still says
 * active (typical failure mode when a Stripe webhook is delayed or lost).
 *
 * Returns the effective row (post-downgrade if applicable) or null when no
 * row exists for the user. The DB write is best-effort; the returned object
 * always reflects the corrected state regardless of write success.
 */
export async function getEffectiveSubscription(
  supabase: SupabaseClient,
  userId: string,
): Promise<SubscriptionRow | null> {
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!sub) return null;

  const isPaidPlan = sub.plan_type === 'monthly' || sub.plan_type === 'yearly';
  const isExpired =
    isPaidPlan &&
    sub.status === 'active' &&
    !!sub.current_period_end &&
    new Date(sub.current_period_end) < new Date();

  if (isExpired) {
    await supabase
      .from('subscriptions')
      .update({ status: 'canceled', plan_type: 'free' })
      .eq('user_id', userId);
    return { ...sub, status: 'canceled', plan_type: 'free' };
  }

  return sub;
}
