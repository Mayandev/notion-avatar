import { useState, useEffect } from 'react';
import type { GetStaticPropsContext, NextPage } from 'next';
import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AvatarEditor from '@/components/AvatarEditor';
import WhosUsing from '@/components/WhosUsing';
import UseCases from '@/components/UseCases';
import AIFeatureIntroModal from '@/components/Modal/AIFeatureIntro';

const URL = `https://notion-avatar.app/`;

const AI_FEATURE_INTRO_KEY = 'ai-feature-intro-dismissed';

const Home: NextPage = () => {
  const { t } = useTranslation(`common`);
  const [isAIFeatureModalOpen, setIsAIFeatureModalOpen] = useState(false);

  // 检查是否应该显示 AI 功能弹窗
  // eslint-disable-next-line consistent-return
  useEffect(() => {
    // 只在客户端检查 localStorage
    if (typeof window !== 'undefined') {
      const dismissed = localStorage.getItem(AI_FEATURE_INTRO_KEY);
      if (!dismissed) {
        // 延迟显示，让页面先加载
        const timer = setTimeout(() => {
          setIsAIFeatureModalOpen(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleDontShowAgain = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AI_FEATURE_INTRO_KEY, 'true');
    }
    setIsAIFeatureModalOpen(false);
  };

  // FAQ数据
  const faqItems = [
    { question: 'faq.whatIsAvatar', answer: 'faq.whatIsAvatarAnswer' },
    { question: 'faq.howToUse', answer: 'faq.howToUseAnswer' },
    { question: 'faq.commercialUse', answer: 'faq.commercialUseAnswer' },
    {
      question: 'faq.supportedBrowsers',
      answer: 'faq.supportedBrowsersAnswer',
    },
    {
      question: 'faq.isBelongToNotion',
      answer: 'faq.isBelongToNotionAnswer',
    },
  ];

  return (
    <>
      <Head>
        <link
          rel="apple-touch-icon"
          sizes="57x57"
          href="/favicon/apple-icon-57x57.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="60x60"
          href="/favicon/apple-icon-60x60.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="72x72"
          href="/favicon/apple-icon-72x72.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="76x76"
          href="/favicon/apple-icon-76x76.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="114x114"
          href="/favicon/apple-icon-114x114.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="120x120"
          href="/favicon/apple-icon-120x120.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="144x144"
          href="/favicon/apple-icon-144x144.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/favicon/apple-icon-152x152.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon/apple-icon-180x180.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/favicon/android-icon-192x192.png"
        />
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
        <title>{t(`siteTitle`)}</title>
        <meta name="description" content={t(`siteDescription`)} />
        <meta name="msapplication-TileColor" content="#fffefc" />
        <meta
          name="msapplication-TileImage"
          content="/favicon/ms-icon-144x144.png"
        />
        <meta name="theme-color" content="#fffefc" />
        <meta name="keywords" content={t('siteKeywords')} />
        <meta name="author" content="Notion Avatar" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta content={t(`siteDescription`)} name="description" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={t(`siteTitle`)} />
        <meta property="og:title" content={t(`siteTitle`)} />
        <meta property="og:description" content={t(`siteDescription`)} />
        <meta property="og:url" content={URL} />
        <meta property="og:image" content="https://i.imgur.com/F5R0K03.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://i.imgur.com/F5R0K03.png" />
        <meta name="twitter:site" content="@phillzou" />
        <meta name="twitter:title" content={t(`siteTitle`)} />
        <meta name="twitter:description" content={t(`siteDescription`)} />
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#fffefc" />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta name="google" content="notranslate" />
        <link rel="canonical" href="https://notion-avatar.app" />
        {/* 添加所有语言的备用链接 */}
        <link
          rel="alternate"
          hrefLang="en"
          href="https://notion-avatar.app/en"
        />
        <link
          rel="alternate"
          hrefLang="zh"
          href="https://notion-avatar.app/zh"
        />
        <link
          rel="alternate"
          hrefLang="zh-TW"
          href="https://notion-avatar.app/zh-TW"
        />
        <link
          rel="alternate"
          hrefLang="ja"
          href="https://notion-avatar.app/ja"
        />
        <link
          rel="alternate"
          hrefLang="ko"
          href="https://notion-avatar.app/ko"
        />
        <link
          rel="alternate"
          hrefLang="es"
          href="https://notion-avatar.app/es"
        />
        <link
          rel="alternate"
          hrefLang="fr"
          href="https://notion-avatar.app/fr"
        />
        <link
          rel="alternate"
          hrefLang="de"
          href="https://notion-avatar.app/de"
        />
        <link
          rel="alternate"
          hrefLang="ru"
          href="https://notion-avatar.app/ru"
        />
        <link
          rel="alternate"
          hrefLang="pt"
          href="https://notion-avatar.app/pt"
        />
        <link
          rel="alternate"
          hrefLang="x-default"
          href="https://notion-avatar.app"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link href="/fonts/Quicksand.tff" as="font" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: t('siteTitle'),
              description: t('siteDescription'),
              url: URL,
              applicationCategory: 'DesignApplication',
              operatingSystem: 'Web',
            }),
          }}
        />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Notion Avatar" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-tap-highlight" content="no" />
        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.json" />
      </Head>

      <Header />
      <main className="my-5">
        <AvatarEditor />
        <section className="py-16 my-12">
          <div className="container mx-auto px-4 md:px-8">
            <h2 className="text-2xl font-bold text-center mb-12 text-gray-900 ">
              {t('steps.title')}
            </h2>
            <div className="max-w-3xl mx-auto space-y-8">
              <div className="flex">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-bold mr-4">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {t('steps.step1Title')}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {t('steps.step1Desc')}
                  </p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-bold mr-4">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {t('steps.step2Title')}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {t('steps.step2Desc')}
                  </p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-bold mr-4">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {t('steps.step3Title')}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {t('steps.step3Desc')}
                  </p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-bold mr-4">
                  4
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {t('steps.step4Title')}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {t('steps.step4Desc')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* <ResourceStore /> */}
        <WhosUsing />
        <UseCases />

        <section className="py-16 my-12">
          <div className="container mx-auto px-4 md:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
              {t('faq.title')}
            </h2>
            <div className="max-w-3xl mx-auto space-y-10">
              {faqItems.map((item) => (
                <div
                  key={item.answer}
                  className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    {t(item.question)}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {t(item.answer)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <AIFeatureIntroModal
        isOpen={isAIFeatureModalOpen}
        onClose={() => setIsAIFeatureModalOpen(false)}
        onDontShowAgain={handleDontShowAgain}
      />
    </>
  );
};

export async function getStaticProps({
  locale,
}: GetStaticPropsContext & { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [`common`])),
    },
  };
}

export default Home;
