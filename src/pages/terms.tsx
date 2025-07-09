/* eslint-disable */
import type { GetStaticPropsContext, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import Header, { BackToHome } from './components/Header';
import Footer from './components/Footer';

const URL = `https://notion-avatar.app/`;
const Terms: NextPage = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex flex-col">
      <Head>
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
          <title>Terms of User</title>
          <meta name="description" content={t(`siteDescription`)} />
          <meta name="msapplication-TileColor" content="#fffefc" />
          <meta
            name="msapplication-TileImage"
            content="/favicon/ms-icon-144x144.png"
          />
          <meta name="theme-color" content="#fffefc" />
          <meta name="keywords" content={t('siteKeywords')} />
          <meta name="author" content="Notion Avatar" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
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
          <meta
            name="twitter:image"
            content="https://i.imgur.com/F5R0K03.png"
          />
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
          <meta
            name="apple-mobile-web-app-status-bar-style"
            content="default"
          />
          <meta name="apple-mobile-web-app-title" content="Notion Avatar" />
          <meta name="format-detection" content="telephone=no" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="msapplication-tap-highlight" content="no" />
          {/* PWA manifest */}
          <link rel="manifest" href="/manifest.json" />
        </Head>
      </Head>
      <Header />
      <main className="flex-grow max-w-3xl mx-auto px-4 pb-6">
        <BackToHome />
        <h1 className="text-3xl font-bold mb-8 text-gray-900 border-b pb-2">
          Terms of Use
        </h1>
        <div className="prose max-w-none">
          <p>Last Updated: June 09, 2025</p>

          <div className="bg-gray-100 p-4 rounded-lg my-6">
            <p>
              By using Notion Avatar, you agree to these Terms of Use. Please
              read them carefully. If you don't agree with these terms, please
              do not use our service.
            </p>
          </div>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using Notion Avatar ("the Service"), you agree to be
            bound by these Terms of Use. These Terms apply to all visitors,
            users, and others who access or use the Service.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4 text-black">
            2. Description of Service
          </h2>
          <p className="mb-4 text-gray-700">
            Notion Avatar is a free online tool that allows users to make
            notion-style image. The Service processes images directly in your
            browser and does not store uploaded images on our servers.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4 text-black">
            3. User Rights and Restrictions
          </h2>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-800">
            3.1 Permitted Use
          </h3>
          <p className="mb-4 text-gray-700">
            You may use the Services for personal or commercial purposes. You
            retain all rights to your original images.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-800">
            3.2 Prohibited Use
          </h3>
          <p className="mb-3 text-gray-700">You may not use the Service to:</p>
          <ul className="list-none space-y-2 mb-6 pl-5">
            <li className="relative pl-6 text-gray-700">
              <span className="absolute left-0 text-gray-500">•</span>
              Violate any applicable law or regulation
            </li>
            <li className="relative pl-6 text-gray-700">
              <span className="absolute left-0 text-gray-500">•</span>
              To process or create images that are illegal, harmful,
              threatening, abusive, harassing, vulgar, or otherwise
              objectionable
            </li>
            <li className="relative pl-6 text-gray-700">
              <span className="absolute left-0 text-gray-500">•</span>
              To infringe upon any patent, trademark, trade secret, copyright,
              or other intellectual property
            </li>
            <li className="relative pl-6 text-gray-700">
              <span className="absolute left-0 text-gray-500">•</span>
              To transmit any malware, spyware, or other malicious code
            </li>
            <li className="relative pl-6 text-gray-700">
              <span className="absolute left-0 text-gray-500">•</span>
              To attempt to gain unauthorized access to the Service's systems or
              security, or disrupt any aspect of the Service
            </li>
            <li className="relative pl-6 text-gray-700">
              <span className="absolute left-0 text-gray-500">•</span>
              To scrape, data mine, or otherwise collect data from the Service
              through automated means
            </li>
            <li className="relative pl-6 text-gray-700">
              <span className="absolute left-0 text-gray-500">•</span>
              To transmit spam or other unsolicited communications
            </li>
          </ul>

          <h2 className="text-2xl font-bold mt-10 mb-4 text-black">
            4. Intellectual Property
          </h2>
          <p className="mb-4 text-gray-700">
            The Service and its original content, features, and functionality
            are owned by Notion Avatar and are protected by international
            copyright, trademark, patent, trade secret, and other intellectual
            property or proprietary rights laws.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4 text-black">
            5. User Content
          </h2>
          <p className="mb-4 text-gray-700">
            You retain all rights to the images you process using our services.
            We do not claim ownership of your original images. However, by
            processing images on our Service, you grant us a worldwide,
            non-exclusive license to process and display your images solely to
            provide the Service.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4 text-black">
            6. Disclaimer of Warranties
          </h2>
          <p className="mb-4 text-gray-700">
            The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We
            make no warranties, express or implied, regarding the reliability,
            accuracy, or availability of the Service. Your use of the Service is
            at your own risk.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4 text-black">
            7. Limitation of Liability
          </h2>
          <p className="mb-4 text-gray-700">
            In no event shall Notion Avatar, its directors, employees, partners,
            agents, suppliers, or affiliates be liable for any indirect,
            incidental, special, consequential or punitive damages, including
            without limitation, loss of profits, data, use, goodwill, or other
            intangible losses, resulting from your access to or use of or
            inability to access or use the Service.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4 text-black">
            8. Indemnification
          </h2>
          <p className="mb-4 text-gray-700">
            You agree to defend, indemnify and hold harmless Notion Avatar and
            its licensors, licensees, and against any claims, liabilities,
            damages, judgments, awards, losses, costs, expenses, or fees
            (including reasonable attorneys' fees) arising out of or relating to
            your violation of these Terms of Use.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4 text-black">
            9. Advertising
          </h2>
          <p className="mb-4 text-gray-700">
            The Service may display advertisements from third parties. By using
            the Service, you agree to receive such advertisements. We are not
            responsible for the content of these advertisements.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4 text-black">
            10. Third-Party Links
          </h2>
          <p className="mb-4 text-gray-700">
            The Service may contain links to third-party websites or services
            that are not owned or controlled by Notion Avatar. We have no
            control over, and assume no responsibility for, the content, privacy
            policies, or practices of any third-party websites or services.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4 text-black">
            11. Termination
          </h2>
          <p className="mb-4 text-gray-700">
            We may terminate or suspend your access to the Service immediately,
            without prior notice or liability, for any reason whatsoever,
            including without limitation if you breach the Terms of Use.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4 text-black">
            12. Changes to Terms
          </h2>
          <p className="mb-4 text-gray-700">
            We reserve the right to modify or replace these Terms at any time.
            We will provide notice of any changes by posting the new Terms on
            this page and updating the "Last Updated" date. Your continued use
            of the Service after any such changes constitutes your acceptance of
            the new Terms of Use.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4 text-black">
            13. Governing Law
          </h2>
          <p className="mb-4 text-gray-700">
            These Terms shall be governed by and construed in accordance with
            the laws of the United States, without regard to its conflict of law
            provisions.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4 text-black">
            14. Contact Us
          </h2>
          <p className="mb-4 text-gray-700">
            If you have any questions about these Terms, please contact us at{' '}
            <a href="mailto:contact@notion-avatar.app" className="underline">
              contact@notion-avatar.app
            </a>
          </p>
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
export default Terms;
