import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 等待 router 准备好
    if (!router.isReady) return;

    const handleCallback = async () => {
      const { code, error: queryError, error_description } = router.query;

      // 如果 URL 中有错误参数
      if (queryError) {
        setError((error_description as string) || (queryError as string));
        return;
      }

      // 如果有 code，重定向到 API 处理
      if (code && typeof code === 'string') {
        // 获取 next 参数或从 sessionStorage 获取保存的 redirect
        const { next } = router.query;
        const savedRedirect =
          typeof window !== 'undefined'
            ? sessionStorage.getItem('auth_redirect')
            : null;
        const redirectTo = next || savedRedirect || '/';

        // 清除保存的 redirect
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('auth_redirect');
        }

        // 将 code 和 next 发送到 API 处理
        const nextParam =
          redirectTo !== '/' ? `&next=${encodeURIComponent(redirectTo)}` : '';
        window.location.href = `/api/auth/callback?code=${encodeURIComponent(
          code,
        )}${nextParam}`;
        return;
      }

      // 没有 code 也没有错误，跳转到首页
      router.push('/');
    };

    handleCallback();
  }, [router, router.isReady, router.query]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffefc]">
        <div className="text-center">
          <p className="text-red-500 mb-4">❌ {error}</p>
          <button
            type="button"
            onClick={() => router.push('/auth/login')}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fffefc]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4" />
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}
