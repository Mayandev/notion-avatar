import type { NextApiRequest, NextApiResponse } from 'next';
import { generateAvatar } from '@/lib/gemini';
import { AIGenerateRequest, AIGenerateResponse } from '@/types/ai';
import { createClient, createServiceClient } from '@/lib/supabase/server';

const FREE_DAILY_LIMIT = 1;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AIGenerateResponse>,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed',
    });
  }

  try {
    const { mode, image, description } = req.body as AIGenerateRequest;

    if (!mode || (mode !== 'photo2avatar' && mode !== 'text2avatar')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid generation mode',
      });
    }

    if (mode === 'photo2avatar' && !image) {
      return res.status(400).json({
        success: false,
        error: 'Image is required for photo2avatar mode',
      });
    }

    if (mode === 'text2avatar' && !description) {
      return res.status(400).json({
        success: false,
        error: 'Description is required for text2avatar mode',
      });
    }

    const supabase = createClient(req, res);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Check usage limits
    let canGenerate = false;
    let useCredits = false;

    if (user) {
      // Check subscription
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (
        subscription?.plan_type === 'monthly' &&
        subscription?.status === 'active'
      ) {
        // Unlimited for paid subscribers
        canGenerate = true;
      } else {
        // Check free daily limit
        const today = new Date().toISOString().split('T')[0];
        const { data: dailyUsage } = await supabase
          .from('daily_usage')
          .select('count')
          .eq('user_id', user.id)
          .eq('usage_date', today)
          .single();

        const usedToday = dailyUsage?.count || 0;

        if (usedToday < FREE_DAILY_LIMIT) {
          canGenerate = true;
        } else {
          // Check credit packages
          const { data: credits } = await supabase
            .from('credit_packages')
            .select('id, credits_remaining')
            .eq('user_id', user.id)
            .gt('credits_remaining', 0)
            .order('purchased_at', { ascending: true })
            .limit(1);

          if (
            credits &&
            credits.length > 0 &&
            credits[0].credits_remaining > 0
          ) {
            canGenerate = true;
            useCredits = true;
          }
        }
      }
    } else {
      // Guest user - check via rate limiting headers or return error
      return res.status(401).json({
        success: false,
        error: 'Please sign in to generate avatars',
      });
    }

    if (!canGenerate) {
      return res.status(402).json({
        success: false,
        error: 'Daily limit reached. Please upgrade or purchase credits.',
      });
    }

    const input = mode === 'photo2avatar' ? image! : description!;
    const generatedImage = await generateAvatar(mode, input);

    // Record usage
    const serviceClient = createServiceClient();

    // Insert usage record
    await serviceClient.from('usage_records').insert({
      user_id: user!.id,
      generation_mode: mode,
      input_type: mode === 'photo2avatar' ? 'image' : 'text',
    });

    // Update daily usage or credits
    if (useCredits) {
      // Deduct from credits
      const { data: credits } = await supabase
        .from('credit_packages')
        .select('id, credits_remaining')
        .eq('user_id', user!.id)
        .gt('credits_remaining', 0)
        .order('purchased_at', { ascending: true })
        .limit(1);

      if (credits && credits.length > 0) {
        await serviceClient
          .from('credit_packages')
          .update({ credits_remaining: credits[0].credits_remaining - 1 })
          .eq('id', credits[0].id);
      }
    } else {
      // Update daily usage (for free tier)
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('plan_type, status')
        .eq('user_id', user!.id)
        .single();

      if (
        !(
          subscription?.plan_type === 'monthly' &&
          subscription?.status === 'active'
        )
      ) {
        const today = new Date().toISOString().split('T')[0];

        await serviceClient.from('daily_usage').upsert(
          {
            user_id: user!.id,
            usage_date: today,
            count: 1,
          },
          {
            onConflict: 'user_id,usage_date',
          },
        );

        // Increment count if already exists
        await serviceClient
          .rpc('increment_daily_usage', {
            p_user_id: user!.id,
            p_date: today,
          })
          .catch(() => {
            // RPC might not exist, use alternative
          });
      }
    }

    return res.status(200).json({
      success: true,
      image: generatedImage,
    });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal Server Error',
    });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Support large image uploads
    },
  },
};
