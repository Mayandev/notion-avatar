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
        throw new Error(data.error || 'Failed to open billing portal');
      }
    } catch (error) {
      console.error('Billing portal error:', error);
      toast.error('Failed to open billing portal');
    } finally {
      setIsManagingBilling(false);
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

  const planLabel = subscription?.plan_type === 'monthly' ? 'Pro' : 'Free';
  const avatarUrl =
    user.user_metadata?.avatar_url || user.user_metadata?.picture;
  const displayName =
    user.user_metadata?.full_name || user.user_metadata?.name || user.email;

  return (
    <>
      <Head>
        <title>Account | Notion Avatar Maker</title>
      </Head>

      <div className="min-h-screen flex flex-col bg-[#fffefc]">
        <Header />
        <Toaster position="top-center" />

        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Account Settings
            </h1>

            {/* Profile Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Profile</h2>
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
                  Subscription
                </h2>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${
                    planLabel === 'Pro'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {planLabel}
                </span>
              </div>

              {subscription?.plan_type === 'monthly' ? (
                <div className="space-y-3">
                  <p className="text-gray-600">
                    Unlimited generations with Pro subscription
                  </p>
                  {subscription.current_period_end && (
                    <p className="text-sm text-gray-500">
                      {subscription.cancel_at_period_end
                        ? `Cancels on ${new Date(
                            subscription.current_period_end,
                          ).toLocaleDateString()}`
                        : `Renews on ${new Date(
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
                    {isManagingBilling ? 'Loading...' : 'Manage Billing'}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-gray-600">
                    1 free generation per day
                    {credits > 0 && ` + ${credits} credits`}
                  </p>
                  <Link
                    href="/pricing"
                    className="inline-block px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Upgrade to Pro
                  </Link>
                </div>
              )}
            </div>

            {/* Credits Section */}
            {credits > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Credits
                </h2>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-gray-900">
                      {credits}
                    </p>
                    <p className="text-gray-500">credits remaining</p>
                  </div>
                  <Link
                    href="/pricing"
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Buy More
                  </Link>
                </div>
              </div>
            )}

            {/* Usage History */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Recent Generations
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
                            ? 'Photo to Avatar'
                            : 'Text to Avatar'}
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
                  No generations yet.{' '}
                  <Link
                    href="/ai-generator"
                    className="text-black font-medium hover:underline"
                  >
                    Create your first avatar!
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
                Sign Out
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
