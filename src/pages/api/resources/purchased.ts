import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@/lib/supabase/server';

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

    // Fetch user's purchased resource packs
    const { data: purchases, error } = await supabase
      .from('resource_purchases')
      .select('resource_pack_id')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching purchases:', error);
      return res.status(500).json({ error: 'Failed to fetch purchases' });
    }

    const packs = purchases?.map((p) => p.resource_pack_id) || [];

    return res.status(200).json({ packs });
  } catch (error) {
    console.error('Purchased API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
