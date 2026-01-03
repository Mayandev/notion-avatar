import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { GetStaticPropsContext } from 'next';
import toast, { Toaster } from 'react-hot-toast';
import Image from 'next/legacy/image';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Modal from '@/components/Modal/Common';
import { useUsageHistory, usePurchasedPacks } from '@/hooks/useAccountData';

export default function AccountPage() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { user, subscription, credits, isLoading, signOut } = useAuth();

  const isPro =
    subscription?.plan_type === 'monthly' && subscription?.status === 'active';
  const { data: usageHistory = [], isLoading: isLoadingHistory } =
    useUsageHistory(10, isPro);
  const { data: purchasedPacks = [], isLoading: isLoadingPacks } =
    usePurchasedPacks();

  const [isManagingBilling, setIsManagingBilling] = useState(false);
  const [downloadingPack, setDownloadingPack] = useState<string | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [downloadingImage, setDownloadingImage] = useState<string | null>(null);
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (usageHistory.length > 0) {
      const imageIds = usageHistory.filter((r) => r.image_url).map((r) => r.id);
      setLoadingImages(new Set(imageIds));
    }
  }, [usageHistory]);

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

  const handleImagePreview = (imageUrl: string) => {
    setPreviewImageUrl(imageUrl);
  };

  const handleImageDownload = async (imageUrl: string, recordId: string) => {
    setDownloadingImage(recordId);
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `notion-avatar-${recordId}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success(t('download') || 'Downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error(t('account.failedToDownload') || 'Failed to download');
    } finally {
      setDownloadingImage(null);
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

              {isPro ? (
                <div className="space-y-3">
                  {subscription.cancel_at_period_end ? (
                    <p className="text-yellow-600 text-sm font-medium">
                      {t('account.subscriptionWillCancel')}
                    </p>
                  ) : (
                    <p className="text-gray-600">
                      {t('account.unlimitedGenerations')}
                    </p>
                  )}
                  {subscription.current_period_end && (
                    <p className="text-sm text-gray-500">
                      {subscription.cancel_at_period_end
                        ? `${t('account.expiresOn')} ${new Date(
                            subscription.current_period_end,
                          ).toLocaleDateString()}`
                        : `${t('account.renewsOn')} ${new Date(
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
              ) : subscription?.plan_type === 'monthly' &&
                subscription?.status !== 'active' ? (
                <div className="space-y-3">
                  <p className="text-gray-600">
                    {t('account.subscriptionCanceled')}
                  </p>
                  <Link
                    href="/pricing"
                    className="inline-block px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    {t('account.resubscribe')}
                  </Link>
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
              {!isPro ? (
                <div className="text-center py-8">
                  <div className="mb-4">
                    <svg
                      className="w-16 h-16 mx-auto text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 mb-2">
                    {t('account.generationHistoryProOnly')}
                  </p>
                  <p className="text-gray-500 text-sm mb-4">
                    {t('account.upgradeToViewHistory')}
                  </p>
                  <Link
                    href="/pricing"
                    className="inline-block px-6 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    {t('account.upgradeToPro')}
                  </Link>
                </div>
              ) : isLoadingHistory ? (
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
                      <div className="flex items-center gap-4 flex-1">
                        {record.image_url ? (
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 group cursor-pointer">
                            {loadingImages.has(record.id) && (
                              <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg z-10" />
                            )}
                            <Image
                              src={record.image_url}
                              alt="Generated avatar"
                              layout="fill"
                              objectFit="cover"
                              className={`rounded-lg transition-opacity duration-300 ${
                                loadingImages.has(record.id)
                                  ? 'opacity-0'
                                  : 'opacity-100'
                              }`}
                              onClick={() => {
                                if (record.image_url) {
                                  handleImagePreview(record.image_url);
                                }
                              }}
                              onLoadingComplete={() => {
                                setLoadingImages((prev) => {
                                  const next = new Set(prev);
                                  next.delete(record.id);
                                  return next;
                                });
                              }}
                              onError={() => {
                                setLoadingImages((prev) => {
                                  const next = new Set(prev);
                                  next.delete(record.id);
                                  return next;
                                });
                              }}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (record.image_url) {
                                    handleImagePreview(record.image_url);
                                  }
                                }}
                                type="button"
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-white rounded-full hover:bg-gray-100"
                                title="Preview"
                              >
                                <svg
                                  className="w-4 h-4 text-gray-900"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
                            <svg
                              className="w-8 h-8 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}
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

        {/* Image Preview Modal */}
        {previewImageUrl && (
          <Modal onCancel={() => setPreviewImageUrl(null)}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex flex-col items-center">
                <div className="w-full flex justify-center mb-4">
                  <div className="relative w-full max-w-md">
                    <img
                      src={previewImageUrl}
                      alt="Generated avatar preview"
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                </div>
                <div className="flex gap-3 w-full justify-center">
                  <button
                    onClick={() => {
                      const record = usageHistory.find(
                        (r) => r.image_url === previewImageUrl,
                      );
                      if (record) {
                        handleImageDownload(previewImageUrl, record.id);
                      }
                    }}
                    disabled={
                      downloadingImage ===
                      usageHistory.find((r) => r.image_url === previewImageUrl)
                        ?.id
                    }
                    type="button"
                    className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {downloadingImage ===
                    usageHistory.find((r) => r.image_url === previewImageUrl)
                      ?.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        <span>
                          {t('account.downloading') || 'Downloading...'}
                        </span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                        <span>{t('download') || 'Download'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </Modal>
        )}
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
