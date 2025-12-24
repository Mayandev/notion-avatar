import { useState } from 'react';
import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticPropsContext } from 'next';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthModal from '@/components/Auth/AuthModal';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for trying out',
    features: [
      '1 generation per day',
      'Photo to Avatar',
      'Text to Avatar',
      'Standard quality',
    ],
    buttonText: 'Current Plan',
    buttonVariant: 'secondary' as const,
    priceType: null,
  },
  {
    name: 'Pro Monthly',
    price: '$9.99',
    period: 'per month',
    description: 'For power users',
    features: [
      'Unlimited generations',
      'Photo to Avatar',
      'Text to Avatar',
      'High quality output',
      'Priority processing',
      'Generation history',
    ],
    buttonText: 'Subscribe Now',
    buttonVariant: 'primary' as const,
    priceType: 'monthly',
    popular: true,
  },
  {
    name: 'Credit Pack',
    price: '$4.99',
    period: '10 credits',
    description: 'Pay as you go',
    features: [
      '10 generations',
      'Never expires',
      'Photo to Avatar',
      'Text to Avatar',
      'Standard quality',
    ],
    buttonText: 'Buy Credits',
    buttonVariant: 'secondary' as const,
    priceType: 'credits',
  },
];

export default function PricingPage() {
  const { user, subscription } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSelectPlan = async (priceType: string | null) => {
    if (!priceType) return;

    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    setLoadingPlan(priceType);

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceType }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout');
      }
    } catch {
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const isCurrentPlan = (planName: string) => {
    if (
      planName === 'Free' &&
      (!subscription || subscription.plan_type === 'free')
    ) {
      return true;
    }
    if (
      planName === 'Pro Monthly' &&
      subscription?.plan_type === 'monthly' &&
      subscription?.status === 'active'
    ) {
      return true;
    }
    return false;
  };

  return (
    <>
      <Head>
        <title>Pricing | Notion Avatar Maker</title>
        <meta
          name="description"
          content="Choose the perfect plan for your avatar creation needs"
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
              Simple, Transparent Pricing
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the plan that works best for you. Upgrade anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-white rounded-2xl shadow-lg border-2 p-8 flex flex-col ${
                  plan.popular ? 'border-black scale-105' : 'border-gray-100'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-black text-white text-sm font-medium px-4 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    <span className="text-gray-500">/{plan.period}</span>
                  </div>
                  <p className="text-gray-600 mt-2">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-green-500 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectPlan(plan.priceType)}
                  disabled={
                    isCurrentPlan(plan.name) || loadingPlan === plan.priceType
                  }
                  type="button"
                  className={`w-full py-3 px-4 rounded-xl font-bold transition-all ${
                    isCurrentPlan(plan.name)
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : plan.buttonVariant === 'primary'
                      ? 'bg-black text-white hover:bg-gray-800'
                      : 'bg-white text-black border-2 border-black hover:bg-gray-50'
                  } disabled:opacity-50`}
                >
                  {loadingPlan === plan.priceType
                    ? 'Loading...'
                    : isCurrentPlan(plan.name)
                    ? 'Current Plan'
                    : plan.buttonText}
                </button>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mt-20 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-2">
                  What happens when I run out of free generations?
                </h3>
                <p className="text-gray-600">
                  Free users get 1 generation per day. Once you&apos;ve used it,
                  you can either wait until tomorrow, purchase a credit pack, or
                  subscribe to Pro for unlimited access.
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-2">
                  Do credits expire?
                </h3>
                <p className="text-gray-600">
                  No! Credits never expire. Use them whenever you need them.
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-2">
                  Can I cancel my subscription anytime?
                </h3>
                <p className="text-gray-600">
                  Yes, you can cancel your Pro subscription at any time.
                  You&apos;ll continue to have access until the end of your
                  billing period.
                </p>
              </div>
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
