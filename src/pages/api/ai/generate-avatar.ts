import type { NextApiRequest, NextApiResponse } from 'next';
import { randomUUID } from 'crypto';
import { generateAvatar } from '@/lib/gemini';
import { AIGenerateRequest, AIGenerateResponse } from '@/types/ai';
import {
  createClient,
  createServiceClient,
  base64ToBuffer,
  uploadImageToStorage,
} from '@/lib/supabase/server';
import { FREE_DAILY_LIMIT } from '@/lib/date';
import { addWatermark } from '@/lib/watermark';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AIGenerateResponse>,
) {
  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ success: false, error: 'Method Not Allowed' });
  }
  const { mode, image, description } = (req.body || {}) as AIGenerateRequest;
  if (
    !['photo2avatar', 'text2avatar'].includes(mode) ||
    (mode === 'photo2avatar' && (typeof image !== 'string' || !image)) ||
    (mode === 'text2avatar' &&
      (typeof description !== 'string' ||
        !description.trim() ||
        description.length > 1000))
  ) {
    return res
      .status(400)
      .json({ success: false, error: 'Invalid generation input' });
  }
  const requestId = req.headers['idempotency-key'] || randomUUID();
  if (
    typeof requestId !== 'string' ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      requestId,
    )
  ) {
    return res
      .status(400)
      .json({ success: false, error: 'Invalid request ID' });
  }

  let reservationId: string | undefined;
  let userId: string | undefined;
  let modelCompleted = false;
  let service: ReturnType<typeof createServiceClient> | undefined;
  try {
    const client = createClient(req, res);
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: 'Please sign in to generate avatars' });
    }
    userId = user.id;
    service = createServiceClient();
    const { data: reservation, error } = await service.rpc(
      'reserve_avatar_generation',
      {
        p_user_id: userId,
        p_request_id: requestId,
        p_free_limit: FREE_DAILY_LIMIT,
      },
    );
    if (error || !reservation) {
      // Fail closed: never fall back to generating before reserving allowance.
      console.error('Generation reservation failed:', error);
      return res.status(503).json({
        success: false,
        error: 'Generation is temporarily unavailable. Please try again later.',
      });
    }
    if (reservation.status === 'limit') {
      return res.status(402).json({
        success: false,
        error: 'Daily limit reached. Please upgrade or purchase credits.',
      });
    }
    if (reservation.status !== 'reserved' || !reservation.id) {
      return res.status(409).json({
        success: false,
        error:
          'A generation is already in progress or this request was already processed.',
      });
    }
    reservationId = reservation.id;
    const generatedImage = await generateAvatar(
      mode,
      mode === 'photo2avatar' ? image! : description!,
    );
    const finalImage = reservation.isPaid
      ? generatedImage
      : await addWatermark(generatedImage);
    modelCompleted = true;

    let imagePath: string | null = null;
    if (reservation.isPaid) {
      try {
        imagePath = await uploadImageToStorage(
          base64ToBuffer(generatedImage),
          userId,
        );
      } catch (uploadError) {
        console.error('Failed to save generated image:', uploadError);
      }
    }
    const completion = {
      p_user_id: userId,
      p_reservation_id: reservationId,
      p_success: true,
      p_mode: mode,
      p_image_path: imagePath,
    };
    // Safe to retry a completion: the database records each reservation once.
    let result = await service.rpc('finish_avatar_generation', completion);
    if (result.error)
      result = await service.rpc('finish_avatar_generation', completion);
    if (result.error || result.data?.status !== 'completed') {
      console.error('Generation completion failed:', result.error);
      return res.status(503).json({
        success: false,
        error: 'Could not finalize generation. Please try again later.',
      });
    }
    return res.status(200).json({
      success: true,
      image: finalImage,
      isPaid: reservation.isPaid,
    });
  } catch (error) {
    // A successful but unacknowledged completion must never be refunded twice.
    // Expired reservations are recovered by the next reserve transaction.
    if (service && reservationId && userId && !modelCompleted) {
      const refund = {
        p_user_id: userId,
        p_reservation_id: reservationId,
        p_success: false,
      };
      try {
        let result = await service.rpc('finish_avatar_generation', refund);
        if (result.error)
          result = await service.rpc('finish_avatar_generation', refund);
        if (result.error)
          console.error('Generation refund failed:', result.error);
      } catch (refundError) {
        console.error('Generation refund failed:', refundError);
      }
    }
    console.error('Generation failed:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate avatar. Please try again later.',
    });
  }
}

export const config = {
  api: { bodyParser: { sizeLimit: '4mb' } },
};
