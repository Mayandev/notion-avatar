import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { createClient, createServiceClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-05-28.basil' as Stripe.LatestApiVersion,
});

const STORAGE_BUCKET = 'generated-avatars';

function isStripeResourceMissing(error: unknown): boolean {
  return (
    error instanceof Stripe.errors.StripeInvalidRequestError &&
    error.code === 'resource_missing'
  );
}

async function cleanupStripeCustomer(customerId: string): Promise<void> {
  let subs: Stripe.ApiList<Stripe.Subscription> | null = null;
  try {
    subs = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 100,
    });
  } catch (error) {
    if (isStripeResourceMissing(error)) {
      // eslint-disable-next-line no-console
      console.info(
        `Stripe customer ${customerId} no longer exists; skipping cleanup.`,
      );
      return;
    }
    // eslint-disable-next-line no-console
    console.error('Failed to list Stripe subscriptions:', error);
    return;
  }

  if (subs?.data?.length) {
    await Promise.all(
      subs.data.map(async (subscription) => {
        if (
          subscription.status === 'canceled' ||
          subscription.status === 'incomplete_expired'
        ) {
          return;
        }
        try {
          await stripe.subscriptions.cancel(subscription.id);
        } catch (cancelError) {
          if (isStripeResourceMissing(cancelError)) return;
          // eslint-disable-next-line no-console
          console.error(
            `Failed to cancel subscription ${subscription.id}:`,
            cancelError,
          );
        }
      }),
    );
  }

  try {
    await stripe.customers.del(customerId);
  } catch (error) {
    if (isStripeResourceMissing(error)) {
      // eslint-disable-next-line no-console
      console.info(`Stripe customer ${customerId} already deleted; skipping.`);
      return;
    }
    // eslint-disable-next-line no-console
    console.error(`Failed to delete Stripe customer ${customerId}:`, error);
  }
}

async function cleanupStorageBucket(userId: string): Promise<void> {
  const service = createServiceClient();
  try {
    const { data: files, error: listError } = await service.storage
      .from(STORAGE_BUCKET)
      .list(userId, { limit: 1000 });

    if (listError) {
      // eslint-disable-next-line no-console
      console.error('Failed to list storage files:', listError);
      return;
    }

    if (!files || files.length === 0) return;

    const paths = files.map((file) => `${userId}/${file.name}`);
    const { error: removeError } = await service.storage
      .from(STORAGE_BUCKET)
      .remove(paths);

    if (removeError) {
      // eslint-disable-next-line no-console
      console.error('Failed to remove storage files:', removeError);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Storage cleanup failed:', error);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = createClient(req, res);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { confirmEmail } = req.body || {};
    if (
      typeof confirmEmail !== 'string' ||
      !user.email ||
      confirmEmail.trim().toLowerCase() !== user.email.toLowerCase()
    ) {
      return res
        .status(400)
        .json({ error: 'Email confirmation does not match' });
    }

    const service = createServiceClient();

    const { data: profile } = await service
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (profile?.stripe_customer_id) {
      await cleanupStripeCustomer(profile.stripe_customer_id);
    }

    await cleanupStorageBucket(user.id);

    const { error: deleteError } = await service.auth.admin.deleteUser(user.id);
    if (deleteError) {
      // eslint-disable-next-line no-console
      console.error('Failed to delete auth user:', deleteError);
      return res.status(500).json({ error: 'Failed to delete account' });
    }

    try {
      await supabase.auth.signOut();
    } catch {
      // The auth user is already deleted; signOut may fail. Ignore.
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Account deletion error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
