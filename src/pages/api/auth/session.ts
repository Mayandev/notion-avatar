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
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    if (!session) {
      return res.status(200).json({ user: null, session: null });
    }

    return res.status(200).json({
      user: session.user,
      session: {
        access_token: session.access_token,
        expires_at: session.expires_at,
      },
    });
  } catch (error) {
    console.error('Session error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
