/* eslint-disable */
import type { GetStaticPropsContext, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import Header, { BackToHome } from '@/components/Header';
import Footer from '@/components/Footer';

const URL = `https://notion-avatar.app/`;

const PrivacyPolicy: NextPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col">
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
        <title>Privacy Policy</title>
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
        <meta name="mobile-web-app-capable" content="yes" />
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
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <Header />
      <main className="flex-grow max-w-3xl mx-auto px-4 pb-6">
        <BackToHome />
        <h1 className="text-3xl font-bold mb-8 text-gray-900 border-b pb-2">
          Privacy Policy
        </h1>
        <div className="prose max-w-none">
          <p>Last Updated: May 07, 2026</p>

          <div className="bg-gray-100 p-4 rounded-lg my-6">
            <p>
              We value your privacy. This policy outlines how we handle your
              data when you use Notion Avatar. The short version: we never store
              the photos you upload, and you can delete your account and all
              associated data at any time from the Account page.
            </p>
          </div>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800">
            Information We Don't Collect
          </h2>
          <p>Notion Avatar is designed with privacy in mind:</p>
          <ul className="list-disc pl-8 my-4 space-y-3 text-gray-700">
            <li className="pl-2 leading-relaxed">
              <strong className="text-gray-900">
                No Storage of Uploaded Photos:
              </strong>{' '}
              Photos you upload to the AI Avatar Generator are{' '}
              <strong>never stored</strong> on our servers or in our database.
              They are passed to the AI model only as transient input and
              discarded from memory after the request completes.
            </li>
            <li className="pl-2 leading-relaxed">
              <strong className="text-gray-900">
                No Personal Data Requirements:
              </strong>{' '}
              The classic editor (manual avatar customization) works entirely
              within your browser and does not require an account or send any
              images to our servers.
            </li>
          </ul>

          <h2 className="text-2xl font-bold mt-10 mb-4 text-black">
            How We Handle Uploaded Photos
          </h2>
          <p className="mb-4 text-gray-700">
            When you use the AI Avatar Generator's Photo to Avatar mode, the
            photo you upload follows this strict, privacy-first lifecycle:
          </p>
          <ul className="list-none pl-5 mb-6 space-y-3">
            <li className="relative pl-6 text-gray-700">
              <span className="absolute left-0 text-black">•</span>
              <strong className="text-black">
                Transient Processing Only:
              </strong>{' '}
              Your original photo is sent to the AI model (Google Gemini) as
              input for that single request. We do not persist it to any
              database, file system, object storage, or backup.
            </li>
            <li className="relative pl-6 text-gray-700">
              <span className="absolute left-0 text-black">•</span>
              <strong className="text-black">No Server-Side Logs:</strong>{' '}
              Original images are never written to application logs or analytics
              systems.
            </li>
            <li className="relative pl-6 text-gray-700">
              <span className="absolute left-0 text-black">•</span>
              <strong className="text-black">Generated Avatars:</strong> Only
              the resulting black-and-white Notion-style avatar may be stored,
              and only for Pro subscribers as part of their generation history.
              These are stored in a private bucket and accessed via short-lived
              signed URLs (1-hour expiry).
            </li>
            <li className="relative pl-6 text-gray-700">
              <span className="absolute left-0 text-black">•</span>
              <strong className="text-black">
                Third-Party AI Providers:
              </strong>{' '}
              The AI model provider processes your image according to its own
              privacy policy. We do not retain copies in our environment.
            </li>
            <li className="relative pl-6 text-gray-700">
              <span className="absolute left-0 text-black">•</span>
              <strong className="text-black">Classic Editor:</strong> Manual
              avatar customization runs entirely in your browser; no images are
              ever transmitted to our servers.
            </li>
          </ul>

          <h2 className="text-2xl font-bold mt-10 mb-4 text-black">
            Information We Do Collect
          </h2>
          <p className="mb-4 text-gray-700">
            We collect limited information to improve our service:
          </p>

          <ul className="list-none pl-5 mb-6 space-y-4">
            <li className="relative pl-6">
              <span className="absolute left-0 text-black">•</span>
              <strong className="text-black">Usage Data:</strong> We use
              analytics tools to collect anonymous information about how users
              interact with our website. This includes:
              <ul className="list-none pl-8 mt-2 space-y-1">
                <li className="relative pl-5">
                  <span className="absolute left-0 text-black">◦</span>
                  Browser type and version
                </li>
                <li className="relative pl-5">
                  <span className="absolute left-0 text-black">◦</span>
                  Operating system
                </li>
                <li className="relative pl-5">
                  <span className="absolute left-0 text-black">◦</span>
                  Time and duration of visit
                </li>
                <li className="relative pl-5">
                  <span className="absolute left-0 text-black">◦</span>
                  Pages visited
                </li>
                <li className="relative pl-5">
                  <span className="absolute left-0 text-black">◦</span>
                  Referring website
                </li>
              </ul>
            </li>
            <li className="relative pl-6">
              <span className="absolute left-0 text-black">•</span>
              <strong className="text-black">Cookies:</strong> We use cookies to
              enhance your experience and collect anonymous usage data. You can
              configure your browser to reject cookies, but this may limit some
              functionality.
            </li>
          </ul>

          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              How We Use Information
            </h2>
            <p className="mb-4 text-gray-700">
              The limited information we collect is used for:
            </p>
            <ul className="list-none space-y-2 mb-6">
              <li className="relative pl-6 text-gray-700">
                <span className="absolute left-0 text-gray-500">•</span>
                Analyzing usage patterns to improve our website
              </li>
              <li className="relative pl-6 text-gray-700">
                <span className="absolute left-0 text-gray-500">•</span>
                Diagnosing technical issues
              </li>
              <li className="relative pl-6 text-gray-700">
                <span className="absolute left-0 text-gray-500">•</span>
                Enhancing the user experience
              </li>
              <li className="relative pl-6 text-gray-700">
                <span className="absolute left-0 text-gray-500">•</span>
                Understanding which features are most valuable to users
              </li>
            </ul>
          </div>

          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Third-Party Services
            </h2>
            <p className="mb-4 text-gray-700">
              We use the following third-party services:
            </p>
            <ul className="list-none space-y-4 mb-6">
              <li className="relative pl-6 text-gray-700">
                <span className="absolute left-0 text-gray-500">•</span>
                <strong className="text-gray-900">Google Analytics:</strong> We
                use Google Analytics to understand user behavior. Google
                Analytics may collect information about your device, browsing
                session, and how you interact with our site. You can learn more
                about Google Analytics' privacy practices at Google's Privacy
                Policy.
              </li>
              <li className="relative pl-6 text-gray-700">
                <span className="absolute left-0 text-gray-500">•</span>
                <strong className="text-gray-900">Google AdSense:</strong> We
                display advertisements through Google AdSense, which may use
                cookies to personalize advertisements based on your browsing
                behavior.
              </li>
            </ul>
          </div>

          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Your Rights
            </h2>
            <p className="mb-4 text-gray-700">
              In line with the EU General Data Protection Regulation (GDPR) and
              similar privacy laws, you have the right to:
            </p>
            <ul className="list-none space-y-2 mb-6">
              <li className="relative pl-6 text-gray-700">
                <span className="absolute left-0 text-gray-500">•</span>
                Request information about what data we have collected about you
              </li>
              <li className="relative pl-6 text-gray-700">
                <span className="absolute left-0 text-gray-500">•</span>
                Request deletion of data where applicable (Right to Erasure,
                GDPR Article 17)
              </li>
              <li className="relative pl-6 text-gray-700">
                <span className="absolute left-0 text-gray-500">•</span>
                Request a copy of your personal data (Right to Data Portability,
                GDPR Article 20)
              </li>
              <li className="relative pl-6 text-gray-700">
                <span className="absolute left-0 text-gray-500">•</span>
                Opt out of cookies and tracking technologies
              </li>
              <li className="relative pl-6 text-gray-700">
                <span className="absolute left-0 text-gray-500">•</span>
                Object to our use of your information
              </li>
            </ul>

            <h3 className="text-xl font-semibold mt-8 mb-3 text-gray-800">
              Self-Service Account Deletion
            </h3>
            <p className="mb-4 text-gray-700">
              If you have created an account, you can permanently delete your
              account and all associated data at any time:
            </p>
            <ol className="list-decimal pl-8 mb-4 space-y-2 text-gray-700">
              <li>
                Sign in and go to the{' '}
                <a
                  href="/account"
                  className="text-black font-medium hover:underline"
                >
                  Account
                </a>{' '}
                page.
              </li>
              <li>
                Scroll down to the <strong>Danger Zone</strong> section and
                click <strong>Delete Account</strong>.
              </li>
              <li>
                Confirm by typing your email address in the dialog that appears.
              </li>
            </ol>
            <p className="mb-4 text-gray-700">
              Once confirmed, the deletion takes effect{' '}
              <strong>immediately</strong> and removes:
            </p>
            <ul className="list-disc pl-8 mb-4 space-y-1 text-gray-700">
              <li>Your profile and login credentials (auth records)</li>
              <li>
                Your active Stripe subscriptions (canceled without refund) and
                Stripe customer record
              </li>
              <li>All generated avatars stored in our private bucket</li>
              <li>Generation history, daily usage counters, and credits</li>
              <li>Resource pack purchase records and promo redemptions</li>
            </ul>
            <p className="mb-6 text-gray-700">
              Account deletion is irreversible. If you would prefer to submit a
              request manually, or to exercise any other right (access,
              portability, objection), email us at{' '}
              <a
                href="mailto:contact@notion-avatar.app"
                className="hover:underline"
              >
                contact@notion-avatar.app
              </a>{' '}
              and we will respond within 30 days as required by GDPR.
            </p>
          </div>

          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Children's Privacy
            </h2>
            <p className="mb-6 text-gray-700">
              Our service is not directed to children under 13, and we do not
              knowingly collect personal information from children under 13. If
              you believe we might have collected information from a child under
              13, please contact us.
            </p>
          </div>

          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Changes to This Policy
            </h2>
            <p className="mb-6 text-gray-700">
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by posting the new Privacy Policy on
              this page and updating the "Last Updated" date.
            </p>
          </div>

          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Contact Us
            </h2>
            <p className="text-gray-700">
              If you have any questions about this Privacy Policy, please
              contact us at{' '}
              <a
                href="mailto:contact@notion-avatar.app"
                className="hover:underline"
              >
                contact@notion-avatar.app
              </a>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
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

export default PrivacyPolicy;
