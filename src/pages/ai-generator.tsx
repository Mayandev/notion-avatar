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
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t('ai.title')} 🪄
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('ai.description')}
            </p>
          </div>

          <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl p-8 border-4 border-gray-100">
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
