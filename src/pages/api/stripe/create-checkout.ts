import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

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

    const { priceType } = req.body; // 'monthly' or 'credits'

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    let customerId = profile?.stripe_customer_id;
    let needsCreate = !customerId;

    // Verify customer exists if we have an ID
    if (customerId) {
      try {
        await stripe.customers.retrieve(customerId);
      } catch (error: any) {
        // Customer doesn't exist or is invalid, create a new one
        if (error.code === 'resource_missing') {
          console.log('Customer not found, creating new one:', customerId);
          needsCreate = true;
          customerId = null;
        } else {
          throw error;
        }
      }
    }

    if (needsCreate) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      customerId = customer.id;

      // Save customer ID to profile
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // Determine the price ID based on type
    const priceId =
      priceType === 'monthly'
        ? process.env.STRIPE_MONTHLY_PRICE_ID
        : process.env.STRIPE_CREDITS_PRICE_ID;

    if (!priceId) {
      return res.status(500).json({ error: 'Price not configured' });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: priceType === 'monthly' ? 'subscription' : 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${req.headers.origin}/ai-generator?success=true`,
      cancel_url: `${req.headers.origin}/pricing?canceled=true`,
      metadata: {
        user_id: user.id,
        price_type: priceType,
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
}
