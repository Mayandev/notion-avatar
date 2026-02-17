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
        // Get existing Set-Cookie headers
        const existingCookies = res.getHeader('Set-Cookie');
        const existingCookiesArray: string[] = Array.isArray(existingCookies)
          ? existingCookies.map(String)
          : existingCookies
          ? [String(existingCookies)]
          : [];

        // Create new cookie strings
        const newCookies = cookiesToSet.map(({ name, value, options }) => {
          const parts = [`${name}=${value}`];
          parts.push(`Path=${options.path || '/'}`);
          if (options.httpOnly) parts.push('HttpOnly');
          if (options.secure) parts.push('Secure');
          parts.push(`SameSite=${options.sameSite || 'Lax'}`);
          if (options.maxAge) parts.push(`Max-Age=${options.maxAge}`);
          return parts.join('; ');
        });

        // Combine existing and new cookies
        res.setHeader('Set-Cookie', [...existingCookiesArray, ...newCookies]);
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

/**
 * Convert base64 image data URL to Buffer
 * @param base64DataUrl - Base64 data URL (e.g., "data:image/png;base64,...")
 * @returns Buffer containing image data
 */
export function base64ToBuffer(base64DataUrl: string): Buffer {
  // Remove data URL prefix if present
  const base64Data = base64DataUrl.replace(/^data:image\/\w+;base64,/, '');
  return Buffer.from(base64Data, 'base64');
}

/**
 * Upload image to Supabase Storage private bucket.
 * Converts to JPEG (quality 0.85) to reduce storage costs by ~50-70%.
 * @param imageBuffer - Buffer containing image data (PNG/JPEG)
 * @param userId - User ID for path organization
 * @param bucketName - Storage bucket name (default: 'generated-avatars')
 * @returns File path in storage (e.g., "{userId}/{timestamp}.jpg")
 */
export async function uploadImageToStorage(
  imageBuffer: Buffer,
  userId: string,
  bucketName = 'generated-avatars',
): Promise<string> {
  const serviceClient = createServiceClient();
  const timestamp = Date.now();
  const filePath = `${userId}/${timestamp}.jpg`;

  // Dynamic import to avoid loading sharp in routes that don't need it
  const sharp = (await import('sharp')).default;
  // Convert to JPEG to reduce storage size (avatars are B&W, JPEG works well)
  const jpegBuffer = await sharp(imageBuffer).jpeg({ quality: 85 }).toBuffer();

  const { error } = await serviceClient.storage
    .from(bucketName)
    .upload(filePath, jpegBuffer, {
      contentType: 'image/jpeg',
      upsert: false, // Don't overwrite existing files
    });

  if (error) {
    throw new Error(`Failed to upload image to storage: ${error.message}`);
  }

  return filePath;
}
