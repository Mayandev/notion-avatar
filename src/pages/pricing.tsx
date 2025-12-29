import { useState } from 'react';
import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticPropsContext } from 'next';
import { Toaster } from 'react-hot-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthModal from '@/components/Auth/AuthModal';
import PricingPlans from '@/components/Pricing/PricingPlans';

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
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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
          <PricingPlans
            plans={plans}
            title="Simple, Transparent Pricing"
            description="Choose the plan that works best for you. Upgrade anytime."
            onAuthRequired={() => setIsAuthModalOpen(true)}
          />

          {/* FAQ Section */}
          <div className="mt-20 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-black">
                <h3 className="font-bold text-gray-900 mb-2">
                  What happens when I run out of free generations?
                </h3>
                <p className="text-gray-600">
                  Free users get 1 generation per day. Once you&apos;ve used it,
                  you can either wait until tomorrow, purchase a credit pack, or
                  subscribe to Pro for unlimited access.
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-black">
                <h3 className="font-bold text-gray-900 mb-2">
                  Do credits expire?
                </h3>
                <p className="text-gray-600">
                  No! Credits never expire. Use them whenever you need them.
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-black">
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
