import { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Public pages and avatar exports do not need session refresh. Keep
    // middleware on account/auth APIs; each API still checks authorization.
    '/account/:path*',
    '/auth/:path*',
    '/api/auth/:path*',
    '/api/user/:path*',
    '/api/usage/:path*',
    '/api/ai/:path*',
    '/api/resources/:path*',
    '/api/stripe/:path*',
    '/api/promo/:path*',
  ],
};
