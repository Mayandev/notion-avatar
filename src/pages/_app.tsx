import { AppProps } from 'next/app';
import '@/styles/global.css';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { appWithTranslation } from 'next-i18next';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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
      ga.pageview(url);
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
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AnyComponent {...pageProps} />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default appWithTranslation(MyApp);
