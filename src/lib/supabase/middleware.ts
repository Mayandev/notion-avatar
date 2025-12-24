import { createServerClient } from '@supabase/ssr';
import { NextResponse, NextRequest } from 'next/server';

// 从 request.cookies 中获取所有 cookies（兼容旧版 Next.js）
function getAllCookies(request: NextRequest) {
  const cookies: { name: string; value: string }[] = [];

  // 从 Cookie header 解析
  const cookieHeader = request.headers.get('cookie') || '';
  cookieHeader.split(';').forEach((cookie) => {
    const [name, ...rest] = cookie.split('=');
    if (name) {
      cookies.push({
        name: name.trim(),
        value: rest.join('=').trim(),
      });
    }
  });

  return cookies;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return getAllCookies(request);
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh the auth token
  await supabase.auth.getUser();

  return supabaseResponse;
}
