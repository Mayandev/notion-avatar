import { createServerClient, CookieOptions } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';
import type { GetServerSidePropsContext } from 'next';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export function createClient(req: NextApiRequest, res: NextApiResponse) {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        const cookies: { name: string; value: string }[] = [];
        Object.entries(req.cookies).forEach(([name, value]) => {
          if (value) {
            cookies.push({ name, value });
          }
        });
        return cookies;
      },
      setAll(
        cookiesToSet: { name: string; value: string; options: CookieOptions }[],
      ) {
        const cookies = cookiesToSet.map(({ name, value, options }) => {
          const parts = [`${name}=${value}`];
          parts.push(`Path=${options.path || '/'}`);
          if (options.httpOnly) parts.push('HttpOnly');
          if (options.secure) parts.push('Secure');
          parts.push(`SameSite=${options.sameSite || 'Lax'}`);
          if (options.maxAge) parts.push(`Max-Age=${options.maxAge}`);
          return parts.join('; ');
        });
        res.setHeader('Set-Cookie', cookies);
      },
    },
  });
}

// Create a service role client for admin operations
export function createServiceClient() {
  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Create a client for getServerSideProps
export function createServerSideClient(context: GetServerSidePropsContext) {
  const { req, res } = context;

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        const cookies: { name: string; value: string }[] = [];
        if (req.cookies) {
          Object.entries(req.cookies).forEach(([name, value]) => {
            if (value) {
              cookies.push({ name, value });
            }
          });
        }
        return cookies;
      },
      setAll(
        cookiesToSet: { name: string; value: string; options: CookieOptions }[],
      ) {
        cookiesToSet.forEach(({ name, value, options }) => {
          const cookieParts = [`${name}=${value}`];
          cookieParts.push(`Path=${options.path || '/'}`);
          if (options.httpOnly) cookieParts.push('HttpOnly');
          if (options.secure) cookieParts.push('Secure');
          cookieParts.push(`SameSite=${options.sameSite || 'Lax'}`);
          if (options.maxAge) cookieParts.push(`Max-Age=${options.maxAge}`);
          res.setHeader('Set-Cookie', cookieParts.join('; '));
        });
      },
    },
  });
}
