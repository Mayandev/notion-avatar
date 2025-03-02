import type { NextApiRequest, NextApiResponse } from 'next';
import type { AvatarConfig } from '@/types';
import { getPreviewRawString } from '../common';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { params } = req.query;
    const config = JSON.parse(
      Buffer.from(params as string, 'base64').toString(),
    ) as AvatarConfig;

    const svgRawContent = getPreviewRawString(config);
    // 设置响应头
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.status(200).send(svgRawContent);
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      data: error?.message || 'Something went wrong',
    });
  }
}
