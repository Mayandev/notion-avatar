import Image from 'next/legacy/image';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import Decoration from './decoration';

export default function Header() {
  const { t } = useTranslation('common');

  return (
    <header className="relative">
      <div className="flex py-5 px-5 sm:px-16 md:px-32">
        <Image
          src="/logo.gif"
          alt="Notion Avatar Logo"
          width={50}
          height={50}
        />
        <span className="text-lg">
          Notion
          <br />
          {t('avatarMaker')}
        </span>
      </div>
      <Decoration className="absolute top-0 right-0 w-24 sm:w-28 md:w-36" />
    </header>
  );
}

export function BackToHome() {
  return (
    <div className="mb-8">
      <Link
        href="/"
        className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors"
        aria-label="Back to homepage"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
        Back to Home
      </Link>
    </div>
  );
}
