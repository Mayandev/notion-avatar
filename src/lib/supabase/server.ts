import {
  createServerClient,
  CookieOptions,
  serializeCookieHeader,
} from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';
import type { GetServerSidePropsContext } from 'next';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Cookie writes must be visible to later reads in this same request, and all
// refreshed cookie chunks must be appended to the response together.
function cookieAdapter(
  req: GetServerSidePropsContext['req'],
  res: GetServerSidePropsContext['res'],
) {
  return {
    getAll() {
      return Object.entries(req.cookies || {})
        .filter(([, value]) => value)
        .map(([name, value]) => ({ name, value: value! }));
    },
    setAll(cookies: { name: string; value: string; options: CookieOptions }[]) {
      const existing = res.getHeader('Set-Cookie');
      const previous = Array.isArray(existing)
        ? existing.map(String)
        : existing
        ? [String(existing)]
        : [];
      cookies.forEach(({ name, value }) => {
        req.cookies[name] = value;
      });
      res.setHeader(
        'Set-Cookie',
        previous.concat(
          cookies.map(({ name, value, options }) =>
            serializeCookieHeader(name, value, {
              ...options,
              path: options.path || '/',
            }),
          ),
        ),
      );
    },
  };
}

export function createClient(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'private, no-store');
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: cookieAdapter(req, res),
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
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: cookieAdapter(context.req, context.res),
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
