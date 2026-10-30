import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { addSignedAvatarUrls } from '@/lib/avatar-history';

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

    const limit = Number(req.query.limit ?? 20);
    const offset = Number(req.query.offset ?? 0);

    if (
      Array.isArray(req.query.limit) ||
      Array.isArray(req.query.offset) ||
      !Number.isSafeInteger(limit) ||
      !Number.isSafeInteger(offset) ||
      limit < 1 ||
      limit > 50 ||
      offset < 0 ||
      !Number.isSafeInteger(offset + limit)
    ) {
      return res.status(400).json({ error: 'Invalid pagination parameters' });
    }

    const {
      data: records,
      error,
      count,
    } = await supabase
      .from('usage_records')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const history = records || [];
    const recordsWithUrls = history.some((record) => record.image_path)
      ? await addSignedAvatarUrls(history, createServiceClient())
      : history;

    return res.status(200).json({
      records: recordsWithUrls,
      total: count,
      limit,
      offset,
    });
  } catch (err) {
    // Log error for debugging (in production, use proper logging service)
    // eslint-disable-next-line no-console
    console.error('Usage history error:', err);
    return res.status(500).json({ error: 'Failed to fetch usage history' });
  }
}
