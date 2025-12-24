import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { provider, email, password } = req.body;

  try {
    const supabase = createClient(req, res);

    // OAuth login (Google/GitHub)
    if (provider === 'google' || provider === 'github') {
      const origin =
        req.headers.origin || req.headers.referer?.replace(/\/$/, '') || '';

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${origin}/api/auth/callback`,
        },
      });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      // Return the OAuth URL for the client to redirect to
      return res.status(200).json({ url: data.url });
    }

    // Email/Password login
    if (email && password) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({
        user: data.user,
        session: {
          access_token: data.session?.access_token,
          expires_at: data.session?.expires_at,
        },
      });
    }

    return res.status(400).json({ error: 'Invalid request' });
  } catch (error) {
    console.error('Signin error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
