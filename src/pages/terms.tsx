/* eslint-disable */
import type { GetStaticPropsContext, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Header, { BackToHome } from './components/Header';
import Footer from './components/Footer';
import { SEOHead } from './components/Header/SEOHead';

const Terms: NextPage = () => (
  <div className="min-h-screen flex flex-col">
    <SEOHead title="Terms of Use" />
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
            By using Notion Avatar, you agree to these Terms of Use. Please read
            them carefully. If you don't agree with these terms, please do not
            use our service.
          </p>
        </div>

        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800">
          1. Acceptance of Terms
        </h2>
        <p>
          By accessing or using Notion Avatar ("the Service"), you agree to be
          bound by these Terms of Use. These Terms apply to all visitors, users,
          and others who access or use the Service.
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
            To process or create images that are illegal, harmful, threatening,
            abusive, harassing, vulgar, or otherwise objectionable
          </li>
          <li className="relative pl-6 text-gray-700">
            <span className="absolute left-0 text-gray-500">•</span>
            To infringe upon any patent, trademark, trade secret, copyright, or
            other intellectual property
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
          The Service and its original content, features, and functionality are
          owned by Notion Avatar and are protected by international copyright,
          trademark, patent, trade secret, and other intellectual property or
          proprietary rights laws.
        </p>

        <h2 className="text-2xl font-bold mt-10 mb-4 text-black">
          5. User Content
        </h2>
        <p className="mb-4 text-gray-700">
          You retain all rights to the images you process using our services. We
          do not claim ownership of your original images. However, by processing
          images on our Service, you grant us a worldwide, non-exclusive license
          to process and display your images solely to provide the Service.
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
          You agree to defend, indemnify and hold harmless Notion Avatar and its
          licensors, licensees, and against any claims, liabilities, damages,
          judgments, awards, losses, costs, expenses, or fees (including
          reasonable attorneys' fees) arising out of or relating to your
          violation of these Terms of Use.
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
          The Service may contain links to third-party websites or services that
          are not owned or controlled by Notion Avatar. We have no control over,
          and assume no responsibility for, the content, privacy policies, or
          practices of any third-party websites or services.
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
          We reserve the right to modify or replace these Terms at any time. We
          will provide notice of any changes by posting the new Terms on this
          page and updating the "Last Updated" date. Your continued use of the
          Service after any such changes constitutes your acceptance of the new
          Terms of Use.
        </p>

        <h2 className="text-2xl font-bold mt-10 mb-4 text-black">
          13. Governing Law
        </h2>
        <p className="mb-4 text-gray-700">
          These Terms shall be governed by and construed in accordance with the
          laws of the United States, without regard to its conflict of law
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
