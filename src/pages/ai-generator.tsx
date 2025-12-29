import { useState, useEffect } from 'react';
import Head from 'next/head';
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
import UseCases from '@/components/UseCases';
import ExamplesShowcase from '@/components/AIGenerator/ExamplesShowcase';
import Image from 'next/legacy/image';

export default function AIGeneratorPage() {
  const { t } = useTranslation('common');
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
        <title>{t('ai.title')} | Notion Avatar Maker</title>
        <meta name="description" content={t('ai.description')} />
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
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 relative z-10">
                {t('ai.title')}
              </h1>
              <div className="absolute right-0 -top-4 sm:-top-8 sm:-right-14 ">
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

          {/* Use Cases Section */}
          <UseCases />

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
