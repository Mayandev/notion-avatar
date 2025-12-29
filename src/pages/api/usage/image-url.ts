import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient, createServiceClient } from '@/lib/supabase/server';

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
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { path, record_id } = req.query;

    let imagePath: string | null = null;

    // If record_id is provided, fetch the image_path from database
    if (record_id && typeof record_id === 'string') {
      const { data: record, error: recordError } = await supabase
        .from('usage_records')
        .select('image_path, user_id')
        .eq('id', record_id)
        .single();

      if (recordError || !record) {
        return res.status(404).json({ error: 'Usage record not found' });
      }

      // Verify that the record belongs to the current user
      if (record.user_id !== user.id) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      imagePath = record.image_path;
    } else if (path && typeof path === 'string') {
      // If path is provided directly, verify it belongs to the user
      // Path format: {user_id}/{timestamp}.png
      const pathUserId = path.split('/')[0];
      if (pathUserId !== user.id) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      imagePath = path;
    } else {
      return res.status(400).json({
        error: 'Either path or record_id parameter is required',
      });
    }

    if (!imagePath) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Generate signed URL using service client
    const serviceClient = createServiceClient();
    const { data: signedUrlData, error: signedUrlError } =
      await serviceClient.storage
        .from('generated-avatars')
        .createSignedUrl(imagePath, 3600); // 1 hour expiry

    if (signedUrlError || !signedUrlData) {
      console.error('Error generating signed URL:', signedUrlError);
      return res.status(500).json({
        error: `Failed to generate signed URL: ${
          signedUrlError?.message || 'Unknown error'
        }`,
      });
    }

    return res.status(200).json({ url: signedUrlData.signedUrl });
  } catch (error) {
    console.error('Image URL API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
