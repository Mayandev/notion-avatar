import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ error: 'Username, email and password are required' });
  }

  if (username.length < 2) {
    return res
      .status(400)
      .json({ error: 'Username must be at least 2 characters' });
  }

  try {
    const supabase = createClient(req, res);
    const origin =
      req.headers.origin || req.headers.referer?.replace(/\/$/, '') || '';

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/api/auth/callback`,
        data: {
          name: username,
          full_name: username,
        },
      },
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({
      user: data.user,
      message: 'Check your email to confirm your account',
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
