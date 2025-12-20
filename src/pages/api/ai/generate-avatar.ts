import type { NextApiRequest, NextApiResponse } from 'next';
import { generateAvatar } from '@/lib/gemini';
import { AIGenerateRequest, AIGenerateResponse } from '@/types/ai';

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

    const input = mode === 'photo2avatar' ? image! : description!;

    // TODO: Daily Limit Check (Phase 3)

    const generatedImage = await generateAvatar(mode, input);

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
