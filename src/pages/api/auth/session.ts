import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getAccountState } from '@/lib/account';
import { EMPTY_ACCOUNT } from '@/types/account';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  res.setHeader('Cache-Control', 'private, no-store');
  if (req.method !== 'GET')
    return res.status(405).json({ error: 'Method not allowed' });
  try {
    const client = createClient(req, res);
    const {
      data: { user },
      error,
    } = await client.auth.getUser();
    if (
      error &&
      error.name !== 'AuthSessionMissingError' &&
      ![400, 401, 403].includes(error.status || 0)
    )
      throw error;
    if (!user) return res.status(200).json(EMPTY_ACCOUNT);
    return res.status(200).json(await getAccountState(client, user));
  } catch (error) {
    console.error('Account state error:', error);
    return res.status(500).json({ error: 'Failed to load account' });
  }
}
