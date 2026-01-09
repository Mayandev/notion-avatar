import { AppProps } from 'next/app';
import '@/styles/global.css';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { appWithTranslation } from 'next-i18next';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Script from 'next/script';

import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import * as ga from '../lib/ga';

const MyApp = ({ Component, pageProps }: AppProps) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60,
            retry: 1,
          },
        },
      }),
  );
  const router = useRouter();
  const AnyComponent = Component as any;

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      // 只有在 GA 加载完成后才记录页面浏览
      if (typeof window !== 'undefined' && window.gtag) {
        ga.pageview(url);
      }
    };
    // When the component is mounted, subscribe to router changes
    // and log those page views
    router.events.on(`routeChangeComplete`, handleRouteChange);
    // If the component is unmounted, unsubscribe
    // from the event with the `off` method
    return () => {
      router.events.off(`routeChangeComplete`, handleRouteChange);
    };
  }, [router.events]);

  return (
    <>
      {/* Google Analytics - 使用 Script 组件延迟加载以减少强制重排 */}
      {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
        </>
      )}
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AnyComponent {...pageProps} />
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </>
  );
};

export default appWithTranslation(MyApp);
