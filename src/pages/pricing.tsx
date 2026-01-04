import { useState, useMemo } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { GetStaticPropsContext } from 'next';
import { Toaster } from 'react-hot-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// 延迟加载非关键组件
const AuthModal = dynamic(() => import('@/components/Auth/AuthModal'), {
  loading: () => null,
});
const PricingPlans = dynamic(
  () => import('@/components/Pricing/PricingPlans'),
  {
    loading: () => null,
  },
);

export default function PricingPage() {
  const { t } = useTranslation('common');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const plans = useMemo(
    () => [
      {
        name: t('pricing.plans.free.name'),
        price: t('pricing.plans.free.price'),
        period: t('pricing.plans.free.period'),
        description: t('pricing.plans.free.description'),
        features: [
          t('pricing.plans.free.features.1'),
          t('pricing.plans.free.features.2'),
          t('pricing.plans.free.features.3'),
          t('pricing.plans.free.features.4'),
        ],
        buttonText: t('pricing.plans.free.buttonText'),
        buttonVariant: 'secondary' as const,
        priceType: null,
      },
      {
        name: t('pricing.plans.pro.name'),
        price: t('pricing.plans.pro.price'),
        period: t('pricing.plans.pro.period'),
        description: t('pricing.plans.pro.description'),
        features: [
          t('pricing.plans.pro.features.1'),
          t('pricing.plans.pro.features.2'),
          t('pricing.plans.pro.features.3'),
          t('pricing.plans.pro.features.4'),
          t('pricing.plans.pro.features.5'),
          t('pricing.plans.pro.features.6'),
          t('pricing.plans.pro.features.7'),
        ],
        buttonText: t('pricing.plans.pro.buttonText'),
        buttonVariant: 'primary' as const,
        priceType: 'monthly',
        popular: true,
      },
      {
        name: t('pricing.plans.credits.name'),
        price: t('pricing.plans.credits.price'),
        period: t('pricing.plans.credits.period'),
        description: t('pricing.plans.credits.description'),
        features: [
          t('pricing.plans.credits.features.1'),
          t('pricing.plans.credits.features.2'),
          t('pricing.plans.credits.features.3'),
          t('pricing.plans.credits.features.4'),
          t('pricing.plans.credits.features.5'),
        ],
        buttonText: t('pricing.plans.credits.buttonText'),
        buttonVariant: 'secondary' as const,
        priceType: 'credits',
      },
    ],
    [t],
  );

  return (
    <>
      <Head>
        <title>{t('pricing.pageTitle')}</title>
        <meta name="description" content={t('pricing.pageDescription')} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://notion-avatar.app/pricing" />
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
            title={t('pricing.title')}
            description={t('pricing.description')}
            onAuthRequired={() => setIsAuthModalOpen(true)}
          />

          {/* FAQ Section */}
          <div className="mt-20 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">
              {t('pricing.faq.title')}
            </h2>
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-black">
                <h3 className="font-bold text-gray-900 mb-2">
                  {t('pricing.faq.q1')}
                </h3>
                <p className="text-gray-600">{t('pricing.faq.a1')}</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-black">
                <h3 className="font-bold text-gray-900 mb-2">
                  {t('pricing.faq.q2')}
                </h3>
                <p className="text-gray-600">{t('pricing.faq.a2')}</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-black">
                <h3 className="font-bold text-gray-900 mb-2">
                  {t('pricing.faq.q3')}
                </h3>
                <p className="text-gray-600">{t('pricing.faq.a3')}</p>
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
