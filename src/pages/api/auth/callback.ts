import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { code, next } = req.query;

  if (code) {
    const supabase = createClient(req, res);

    const { data, error } = await supabase.auth.exchangeCodeForSession(
      code as string,
    );

    if (error) {
      console.error('Auth callback error:', error);
      return res.redirect('/auth/login?error=callback_error');
    }

    // Debug: log successful auth
    console.log('Auth callback success, user:', data.user?.email);
  }

  // Redirect to the next page or AI generator
  const redirectTo = typeof next === 'string' ? next : '/ai-generator';
  return res.redirect(redirectTo);
}
