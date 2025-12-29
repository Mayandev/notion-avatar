import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { code, next } = req.query;

  if (code) {
    const supabase = createClient(req, res);

    const { error } = await supabase.auth.exchangeCodeForSession(
      code as string,
    );

    if (error) {
      // eslint-disable-next-line no-console
      console.error('Auth callback error:', error);
      return res.redirect('/auth/login?error=callback_error');
    }
  }

  // Redirect to the next page or home page
  // If redirectTo is login page, redirect to home instead
  let redirectTo = typeof next === 'string' ? decodeURIComponent(next) : '/';

  // Prevent redirecting back to login page
  if (redirectTo.includes('/auth/login')) {
    // Extract locale from referer or default to 'en'
    const referer = req.headers.referer || '';
    const localeMatch = referer.match(
      /^\w+:\/\/[^/]+\/(zh|zh-TW|ko|ja|es|fr|de|ru|pt)/,
    );
    const locale = localeMatch ? localeMatch[1] : 'en';
    redirectTo = locale === 'en' ? '/' : `/${locale}`;
  }

  return res.redirect(redirectTo);
}
