import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { GetStaticPropsContext } from 'next';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthModal from '@/components/Auth/AuthModal';
import ResourceStore from '@/components/ResourceStore';

export default function ResourcesPage() {
  const { t } = useTranslation('common');
  const { user, isLoading: isAuthLoading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [purchasedPacks, setPurchasedPacks] = useState<string[]>([]);

  // Fetch purchased resource packs - only when user is logged in
  const fetchPurchasedPacks = useCallback(async () => {
    // Only fetch if user is logged in
    if (!user) {
      return;
    }

    try {
      const response = await fetch('/api/resources/purchased');
      if (response.ok) {
        const data = await response.json();
        setPurchasedPacks(data.packs || []);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch purchased packs:', error);
    }
  }, [user]);

  // Check for success query param from Stripe
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      const pack = urlParams.get('pack');
      if (pack && user) {
        toast.success(
          'Payment successful! You can now download your resource pack.',
        );
        // Refresh purchased packs only if user is logged in
        fetchPurchasedPacks();
        // Clean up URL
        window.history.replaceState({}, '', '/resources');
      }
    }
  }, [fetchPurchasedPacks, user]);

  // Only fetch purchased packs when user is logged in
  useEffect(() => {
    if (!isAuthLoading) {
      if (user) {
        // User is logged in, fetch purchased packs
        fetchPurchasedPacks();
      }
      // If user is not logged in, don't set loading state
      // purchasedPacks will remain empty array
    }
  }, [user, isAuthLoading, fetchPurchasedPacks]);

  const handleDownload = async (packId: string) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      const response = await fetch(`/api/resources/download?pack=${packId}`);
      const data = await response.json();

      if (response.ok && data.url) {
        // Open the signed URL in a new window/tab to trigger download
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to download');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Download error:', error);
      toast.error('Failed to download resource pack. Please try again.');
    }
  };

  // Only show loading when checking auth status
  // Don't show loading for purchased packs fetch (happens in background)
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffefc]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Resources | Notion Avatar Maker</title>
        <meta
          name="description"
          content="Download your purchased resource packs"
        />
      </Head>

      <div className="min-h-screen flex flex-col bg-[#fffefc]">
        <Header />
        <Toaster position="top-center" />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />

        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t('resourceStore.title')}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('resourceStore.description')}
            </p>
          </div>

          {!user && (
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8 border-4 border-gray-100 mb-8">
              <p className="text-center text-gray-600 mb-4">
                Please sign in to view and download your purchased resources.
              </p>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                type="button"
                className="w-full py-3 px-6 bg-black text-white rounded-full font-bold hover:bg-gray-800 transition-colors"
              >
                Sign In
              </button>
            </div>
          )}

          <ResourceStore
            purchasedPacks={purchasedPacks}
            onDownload={handleDownload}
            showDownloadButton
          />
        </main>

        <Footer />
      </div>
    </>
  );
}

export async function getStaticProps({
  locale,
}: GetStaticPropsContext & { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}
