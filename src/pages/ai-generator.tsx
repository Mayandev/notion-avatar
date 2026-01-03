import { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { GetStaticPropsContext } from 'next';
import toast, { Toaster } from 'react-hot-toast';

import { AIGenerationMode, AIGenerateResponse } from '@/types/ai';
import { useAIUsage } from '@/hooks/useAIUsage';
import { useAuth } from '@/contexts/AuthContext';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ModeSelector from '@/components/AIGenerator/ModeSelector';
import ImageUploader from '@/components/AIGenerator/ImageUploader';
import TextInput from '@/components/AIGenerator/TextInput';
import GeneratingStatus from '@/components/AIGenerator/GeneratingStatus';
import GeneratedResult from '@/components/AIGenerator/GeneratedResult';
import DailyLimitBanner from '@/components/AIGenerator/DailyLimitBanner';
import AuthModal from '@/components/Auth/AuthModal';
import UpgradeModal from '@/components/Pricing/UpgradeModal';
import PricingPlans from '@/components/Pricing/PricingPlans';
import ExamplesShowcase from '@/components/AIGenerator/ExamplesShowcase';
import Image from 'next/legacy/image';

export default function AIGeneratorPage() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [mode, setMode] = useState<AIGenerationMode>('photo2avatar');
  const [inputImage, setInputImage] = useState<string>('');
  const [inputText, setInputText] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const { usageState, incrementUsage, checkUsage } = useAIUsage();

  // Check for success/canceled query params from Stripe
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      toast.success('Payment successful! You can now generate more avatars.');
      // Clean up URL
      window.history.replaceState({}, '', '/ai-generator');
      // Refresh usage
      checkUsage();
    }
  }, [checkUsage]);

  const handleGenerate = async () => {
    // Check if user is authenticated
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    // Check usage limits
    if (!usageState.isUnlimited && usageState.remaining <= 0) {
      setIsUpgradeModalOpen(true);
      return;
    }

    if (mode === 'photo2avatar' && !inputImage) {
      toast.error(t('ai.uploadTip'));
      return;
    }
    if (mode === 'text2avatar' && !inputText) {
      toast.error(t('ai.descPlaceholder'));
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const response = await fetch('/api/ai/generate-avatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode,
          image: mode === 'photo2avatar' ? inputImage : undefined,
          description: mode === 'text2avatar' ? inputText : undefined,
        }),
      });

      const data: AIGenerateResponse = await response.json();

      if (response.status === 401) {
        setIsAuthModalOpen(true);
        return;
      }

      if (response.status === 402) {
        setIsUpgradeModalOpen(true);
        return;
      }

      if (data.success && data.image) {
        setGeneratedImage(data.image);
        await incrementUsage();
        toast.success('Avatar generated successfully!');
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Generation failed:', error);
      toast.error(t('ai.error'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `notion-avatar-ai-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const canGenerate = usageState.isUnlimited || usageState.remaining > 0;
  const isDisabled = !canGenerate && !!user;

  const scrollToGenerator = () => {
    const element = document.getElementById('ai-generator');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleApplyPrompt = (prompt: string) => {
    // 切换到文字生成模式
    setMode('text2avatar');
    // 设置提示词
    setInputText(prompt);
    // 清除之前的生成结果
    setGeneratedImage(null);
    // 滚动到生成器区域
    setTimeout(() => {
      scrollToGenerator();
    }, 100);
  };

  // Generate SEO URLs based on current locale
  const currentLocale = router.locale || 'en';
  const baseUrl = 'https://notion-avatar.app';
  const pagePath = '/ai-generator';
  const canonicalUrl =
    currentLocale === 'en'
      ? `${baseUrl}${pagePath}`
      : `${baseUrl}/${currentLocale}${pagePath}`;
  const pageTitle = `${t('ai.title')} | Notion Avatar Maker`;
  const pageDescription = t('ai.description');
  const pageKeywords = t('ai.seoKeywords') || t('siteKeywords');
  const ogImage = 'https://i.imgur.com/F5R0K03.png';

  // Generate hreflang URLs
  const locales = [
    'en',
    'zh',
    'zh-TW',
    'ja',
    'ko',
    'es',
    'fr',
    'de',
    'ru',
    'pt',
  ];
  const generateHreflangUrl = (locale: string) =>
    locale === 'en'
      ? `${baseUrl}${pagePath}`
      : `${baseUrl}/${locale}${pagePath}`;

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

  const renderContent = () => {
    if (isGenerating) {
      return <GeneratingStatus />;
    }

    if (generatedImage) {
      return (
        <GeneratedResult
          image={generatedImage}
          onDownload={handleDownload}
          onReset={() => setGeneratedImage(null)}
        />
      );
    }

    return (
      <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        {mode === 'photo2avatar' ? (
          <ImageUploader onImageSelect={setInputImage} disabled={isDisabled} />
        ) : (
          <TextInput
            value={inputText}
            onChange={setInputText}
            disabled={isDisabled}
          />
        )}

        <button
          onClick={handleGenerate}
          disabled={
            isGenerating ||
            (mode === 'photo2avatar' && !inputImage) ||
            (mode === 'text2avatar' && !inputText)
          }
          type="button"
          className="mt-8 py-3 px-12 rounded-full bg-black text-white font-bold text-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        >
          {!user ? `${t('ai.generate')} (Sign In Required)` : t('ai.generate')}
        </button>

        {user && (
          <DailyLimitBanner
            remaining={usageState.remaining}
            total={usageState.total}
            isUnlimited={usageState.isUnlimited}
            freeRemaining={usageState.freeRemaining}
            paidCredits={usageState.paidCredits}
          />
        )}

        {!user && !isAuthLoading && (
          <div className="mt-6 text-center">
            <p className="text-gray-600 mb-2">
              Sign in to start generating avatars
            </p>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              type="button"
              className="text-black font-medium hover:underline"
            >
              Sign In / Sign Up
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={pageKeywords} />
        <meta name="author" content="Notion Avatar" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="theme-color" content="#fffefc" />
        <meta name="msapplication-TileColor" content="#fffefc" />
        <meta
          name="msapplication-TileImage"
          content="/favicon/ms-icon-144x144.png"
        />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta name="google" content="notranslate" />
        <meta charSet="utf-8" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={t('siteTitle')} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@phillzou" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={ogImage} />

        {/* Canonical URL */}
        <link rel="canonical" href={canonicalUrl} />

        {/* Hreflang links */}
        {locales.map((locale) => (
          <link
            key={locale}
            rel="alternate"
            hrefLang={locale}
            href={generateHreflangUrl(locale)}
          />
        ))}
        <link
          rel="alternate"
          hrefLang="x-default"
          href={`${baseUrl}${pagePath}`}
        />

        {/* Favicon links */}
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="96x96"
          href="/favicon/favicon-96x96.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon/favicon-16x16.png"
        />
        <link rel="manifest" href="/manifest.json" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: t('ai.title'),
              description: pageDescription,
              url: canonicalUrl,
              applicationCategory: 'DesignApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
              featureList: [
                'Photo to Avatar conversion',
                'Text to Avatar generation',
                'AI-powered avatar creation',
                'Notion-style avatar design',
              ],
            }),
          }}
        />
      </Head>

      <div className="min-h-screen flex flex-col bg-[#fffefc]">
        <Header />
        <Toaster position="top-center" />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
        <UpgradeModal
          isOpen={isUpgradeModalOpen}
          onClose={() => setIsUpgradeModalOpen(false)}
          onLoginClick={() => {
            setIsUpgradeModalOpen(false);
            setIsAuthModalOpen(true);
          }}
        />

        <main className="flex-grow container mx-auto px-4 py-12">
          {/* Enhanced Hero Section */}
          <section className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="relative inline-block mb-6">
              <h1 className="text-5xl md:text-6xl w-64 md:w-full font-bold text-gray-900 mb-4 relative">
                {t('ai.title')}
              </h1>
              <div className="absolute -right-8 -top-4 md:-top-8 md:-right-14 ">
                <Image
                  src="/icon/ai-stars.svg"
                  width={60}
                  height={60}
                  alt="Stars"
                />
              </div>
            </div>
            <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-8 leading-relaxed">
              {t('ai.heroSubtitle')}
            </p>
          </section>
          {/* Generator Section */}
          <section id="ai-generator" className="mb-16 scroll-mt-20">
            <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl p-8 border-4 border-black">
              {/* Mode Selector */}
              <ModeSelector
                currentMode={mode}
                onModeChange={setMode}
                disabled={isGenerating || !!generatedImage}
              />

              {/* Content Area */}
              <div className="min-h-[400px] flex flex-col items-center justify-center">
                {renderContent()}
              </div>
            </div>
          </section>

          {/* Steps Section */}

          <div className="mt-6 mx-auto flex justify-center">
            <Image src="/icon/arrow.svg" alt="Arrow" width={59} height={126} />
          </div>
          <section className="py-16 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <div className="container mx-auto px-4 md:px-8">
              <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
                {t('ai.steps.title')}
              </h2>
              <div className="max-w-3xl mx-auto space-y-8">
                <div className="flex">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-bold mr-4">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {t('ai.steps.step1Title')}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {t('ai.steps.step1Desc')}
                    </p>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-bold mr-4">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {t('ai.steps.step2Title')}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {t('ai.steps.step2Desc')}
                    </p>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-bold mr-4">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {t('ai.steps.step3Title')}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {t('ai.steps.step3Desc')}
                    </p>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-bold mr-4">
                    4
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {t('ai.steps.step4Title')}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {t('ai.steps.step4Desc')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Examples Showcase Section */}
          <ExamplesShowcase onApplyPrompt={handleApplyPrompt} />

          {/* Pricing Section */}
          <section className="py-16 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
            <div className="container mx-auto px-4 md:px-8">
              <PricingPlans
                plans={plans}
                title={t('ai.pricing.title')}
                description={t('ai.pricing.description')}
                onAuthRequired={() => setIsAuthModalOpen(true)}
              />
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-16 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
            <div className="container mx-auto px-4 md:px-8">
              <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
                {t('ai.faq.title')}
              </h2>
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="bg-white rounded-xl p-6 border-3 border-black">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    {t('ai.faq.q1')}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {t('ai.faq.a1')}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-6 border-3 border-black">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    {t('ai.faq.q2')}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {t('ai.faq.a2')}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-6 border-3 border-black">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    {t('ai.faq.q3')}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {t('ai.faq.a3')}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-6 border-3 border-black">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    {t('ai.faq.q4')}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {t('ai.faq.a4')}
                  </p>
                </div>
              </div>
            </div>
          </section>
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
