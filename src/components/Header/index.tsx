import { useState } from 'react';
import Image from 'next/legacy/image';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import UserMenu from '@/components/Auth/UserMenu';
import AuthModal from '@/components/Auth/AuthModal';
import Decoration from './decoration';

export default function Header() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <header className="relative">
      <div className="flex justify-between items-center py-5 px-5 sm:px-16 md:px-32">
        <div className="flex items-center">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Image
              src="/logo.gif"
              alt="Notion Avatar Logo"
              width={50}
              height={50}
            />
            <span className="text-lg leading-tight">
              Notion
              <br />
              {t('avatarMaker')}
            </span>
          </Link>
        </div>

        <nav className="flex items-center gap-4 relative z-10 mr-5">
          <Link
            href="/ai-generator"
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all ${
              router.pathname === '/ai-generator'
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            <span className="hidden sm:inline">{t('ai.title')}</span>
          </Link>
          <UserMenu onLoginClick={() => setIsAuthModalOpen(true)} />
        </nav>
      </div>
      <Decoration className="absolute top-0 right-0 w-24 sm:w-28 md:w-36 pointer-events-none" />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
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
