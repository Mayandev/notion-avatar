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

    const { limit = 20, offset = 0 } = req.query;

    const {
      data: records,
      error,
      count,
    } = await supabase
      .from('usage_records')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) throw error;

    // Generate signed URLs for records with image_path
    const serviceClient = createServiceClient();
    const recordsWithUrls = await Promise.all(
      (records || []).map(async (record) => {
        if (record.image_path) {
          try {
            const { data: signedUrlData, error: signedUrlError } =
              await serviceClient.storage
                .from('generated-avatars')
                .createSignedUrl(record.image_path, 3600); // 1 hour expiry

            if (!signedUrlError && signedUrlData) {
              return {
                ...record,
                image_url: signedUrlData.signedUrl,
              };
            }
          } catch {
            // Silently fail for individual image URL generation
            // The record will be returned without image_url
          }
        }
        return record;
      }),
    );

    return res.status(200).json({
      records: recordsWithUrls,
      total: count,
      limit: Number(limit),
      offset: Number(offset),
    });
  } catch (err) {
    // Log error for debugging (in production, use proper logging service)
    // eslint-disable-next-line no-console
    console.error('Usage history error:', err);
    return res.status(500).json({ error: 'Failed to fetch usage history' });
  }
}
