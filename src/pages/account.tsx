import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { GetStaticPropsContext } from 'next';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface UsageRecord {
  id: string;
  generation_mode: string;
  created_at: string;
}

export default function AccountPage() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const {
    user,
    subscription,
    credits,
    isLoading,
    signOut,
    refreshSubscription,
  } = useAuth();
  const [usageHistory, setUsageHistory] = useState<UsageRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isManagingBilling, setIsManagingBilling] = useState(false);
  const [purchasedPacks, setPurchasedPacks] = useState<string[]>([]);
  const [isLoadingPacks, setIsLoadingPacks] = useState(true);
  const [downloadingPack, setDownloadingPack] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;

      try {
        const response = await fetch('/api/usage/history?limit=10');
        const data = await response.json();
        setUsageHistory(data.records || []);
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    if (user) {
      fetchHistory();
    }
  }, [user]);

  useEffect(() => {
    const fetchPurchasedPacks = async () => {
      if (!user) {
        setIsLoadingPacks(false);
        return;
      }

      try {
        const response = await fetch('/api/resources/purchased');
        if (response.ok) {
          const data = await response.json();
          setPurchasedPacks(data.packs || []);
        }
      } catch (error) {
        console.error('Failed to fetch purchased packs:', error);
      } finally {
        setIsLoadingPacks(false);
      }
    };

    if (user) {
      fetchPurchasedPacks();
    }
  }, [user]);

  const handleManageBilling = async () => {
    setIsManagingBilling(true);
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      });
      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || t('account.failedToOpenBillingPortal'));
      }
    } catch (error) {
      console.error('Billing portal error:', error);
      toast.error(t('account.failedToOpenBillingPortal'));
    } finally {
      setIsManagingBilling(false);
    }
  };

  const handleDownload = async (packId: string) => {
    setDownloadingPack(packId);
    try {
      const response = await fetch(`/api/resources/download?pack=${packId}`);
      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
        // 延迟清除 loading 状态，给下载一些时间
        setTimeout(() => {
          setDownloadingPack(null);
        }, 2000);
      } else {
        throw new Error(data.error || 'Failed to download');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error(t('account.failedToDownload'));
      setDownloadingPack(null);
    }
  };

  const getPackName = (packId: string) => {
    switch (packId) {
      case 'design-pack':
        return t('resourceStore.designPack.title');
      case 'scribbles-pack':
        return t('resourceStore.scribblesPack.title');
      default:
        return packId;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffefc]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isPro = subscription?.plan_type === 'monthly';
  const planLabel = isPro ? t('menu.pro') : t('menu.free');
  const avatarUrl = user.user_metadata?.avatar_url;
  const displayName =
    user.user_metadata?.full_name || user.user_metadata?.name || user.email;

  return (
    <>
      <Head>
        <title>{t('account.pageTitle')}</title>
      </Head>

      <div className="min-h-screen flex flex-col bg-[#fffefc]">
        <Header />
        <Toaster position="top-center" />

        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              {t('account.title')}
            </h1>

            {/* Profile Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                {t('account.profile')}
              </h2>
              <div className="flex items-center gap-4">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-16 h-16 rounded-full border border-gray-200"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center text-white text-xl font-medium">
                    {displayName?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{displayName}</p>
                  <p className="text-gray-500">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Subscription Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">
                  {t('account.subscription')}
                </h2>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${
                    isPro ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {planLabel}
                </span>
              </div>

              {subscription?.plan_type === 'monthly' ? (
                <div className="space-y-3">
                  <p className="text-gray-600">
                    {t('account.unlimitedGenerations')}
                  </p>
                  {subscription.current_period_end && (
                    <p className="text-sm text-gray-500">
                      {`${t('account.renewsOn')} ${new Date(
                        subscription.current_period_end,
                      ).toLocaleDateString()}`}
                    </p>
                  )}
                  <button
                    onClick={handleManageBilling}
                    disabled={isManagingBilling}
                    type="button"
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    {isManagingBilling
                      ? t('auth.loading')
                      : t('account.manageBilling')}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-gray-600">
                    {t('account.freeGenerationPerDay')}
                    {credits > 0 && ` + ${credits} ${t('menu.credits')}`}
                  </p>
                  <Link
                    href="/pricing"
                    className="inline-block px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    {t('account.upgradeToPro')}
                  </Link>
                </div>
              )}
            </div>

            {/* Credits Section */}
            {credits > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  {t('account.credits')}
                </h2>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-gray-900">
                      {credits}
                    </p>
                    <p className="text-gray-500">
                      {t('account.creditsRemaining')}
                    </p>
                  </div>
                  <Link
                    href="/pricing"
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {t('account.buyMore')}
                  </Link>
                </div>
              </div>
            )}

            {/* Purchased Resources */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                {t('account.purchasedResources')}
              </h2>
              {isLoadingPacks ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto" />
                </div>
              ) : purchasedPacks.length > 0 ? (
                <div className="space-y-3">
                  {purchasedPacks.map((packId) => (
                    <div
                      key={packId}
                      className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {getPackName(packId)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {t('account.resourcePack')}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDownload(packId)}
                        disabled={downloadingPack === packId}
                        type="button"
                        className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {downloadingPack === packId ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                            <span>{t('account.downloading')}</span>
                          </>
                        ) : (
                          t('download')
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  {t('account.noResourcesPurchased')}{' '}
                  <Link
                    href="/resources"
                    className="text-black font-medium hover:underline"
                  >
                    {t('account.browseResourcePacks')}
                  </Link>
                </p>
              )}
            </div>

            {/* Usage History */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                {t('account.recentGenerations')}
              </h2>
              {isLoadingHistory ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto" />
                </div>
              ) : usageHistory.length > 0 ? (
                <div className="space-y-3">
                  {usageHistory.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {record.generation_mode === 'photo2avatar'
                            ? t('ai.photo2avatar')
                            : t('ai.text2avatar')}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(record.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  {t('account.noGenerationsYet')}{' '}
                  <Link
                    href="/ai-generator"
                    className="text-black font-medium hover:underline"
                  >
                    {t('account.createFirstAvatar')}
                  </Link>
                </p>
              )}
            </div>

            {/* Sign Out */}
            <div className="text-center">
              <button
                onClick={signOut}
                type="button"
                className="text-red-600 hover:text-red-700 font-medium"
              >
                {t('account.signOut')}
              </button>
            </div>
          </div>
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
