/* eslint-disable no-console */
import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { createServiceClient } from '@/lib/supabase/server';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-05-28.basil' as Stripe.LatestApiVersion,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    req.on('data', (chunk: Uint8Array) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const buf = await getRawBody(req);
  const sig = req.headers['stripe-signature'] || '';

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res
      .status(400)
      .json({ error: 'Webhook signature verification failed' });
  }

  const supabase = createServiceClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const priceType = session.metadata?.price_type;

        if (!userId) break;

        if (priceType === 'monthly' && session.subscription) {
          // Handle subscription - use any to handle Stripe API response flexibility
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const subscriptionData: any = await stripe.subscriptions.retrieve(
            session.subscription as string,
          );

          console.log(
            'Subscription data:',
            JSON.stringify(subscriptionData, null, 2),
          );

          // Safely convert timestamps
          const startTs = subscriptionData.current_period_start;
          const endTs = subscriptionData.current_period_end;
          const periodStart = startTs
            ? new Date(startTs * 1000).toISOString()
            : null;
          const periodEnd = endTs ? new Date(endTs * 1000).toISOString() : null;

          // Use upsert to handle cases where subscription record may not exist
          const { error: upsertError } = await supabase
            .from('subscriptions')
            .upsert(
              {
                user_id: userId,
                stripe_subscription_id: subscriptionData.id,
                status: 'active',
                plan_type: 'monthly',
                current_period_start: periodStart,
                current_period_end: periodEnd,
              },
              { onConflict: 'user_id' },
            );

          if (upsertError) {
            console.error('Subscription upsert error:', upsertError);
          } else {
            console.log('Subscription updated successfully for user:', userId);
          }
        } else if (priceType === 'credits') {
          // Handle credit purchase (10 credits per package)
          await supabase.from('credit_packages').insert({
            user_id: userId,
            credits_purchased: 10,
            credits_remaining: 10,
            stripe_payment_intent_id: session.payment_intent as string,
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscriptionData = event.data.object as any;

        await supabase
          .from('subscriptions')
          .update({
            status:
              subscriptionData.status === 'active' ? 'active' : 'inactive',
            current_period_start: new Date(
              subscriptionData.current_period_start * 1000,
            ).toISOString(),
            current_period_end: new Date(
              subscriptionData.current_period_end * 1000,
            ).toISOString(),
            cancel_at_period_end: subscriptionData.cancel_at_period_end,
          })
          .eq('stripe_subscription_id', subscriptionData.id);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscriptionData = event.data.object as any;

        await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            plan_type: 'free',
          })
          .eq('stripe_subscription_id', subscriptionData.id);
        break;
      }

      case 'invoice.payment_failed': {
        const invoiceData = event.data.object as any;

        if (invoiceData.subscription) {
          await supabase
            .from('subscriptions')
            .update({
              status: 'past_due',
            })
            .eq('stripe_subscription_id', invoiceData.subscription as string);
        }
        break;
      }

      default:
        // Unhandled event type
        break;
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return res.status(500).json({ error: 'Webhook handler failed' });
  }
}
