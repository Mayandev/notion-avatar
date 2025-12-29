import { useState } from 'react';
import Image from 'next/legacy/image';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import UserMenu from '@/components/Auth/UserMenu';
import AuthModal from '@/components/Auth/AuthModal';
import Decoration, { WaveDecoration } from './decoration';

export default function Header() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <header className="relative">
      <div className="flex justify-between items-center py-5 px-5 sm:px-16 md:px-32">
        <div className="flex items-center gap-4">
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
            <span className="w-36 sm:w-48 text-lg leading-tight relative inline-block">
              Notion {router.pathname === '/ai-generator' ? 'AI' : ''}
              <br />
              {t('avatarMaker')}
              {router.pathname === '/ai-generator' && (
                <span className="absolute top-0 sm:right-24 right-12 transition-opacity">
                  <Image
                    src="/icon/ai-stars.svg"
                    alt="AI Stars"
                    width={18}
                    height={18}
                    className="drop-shadow-sm"
                  />
                </span>
              )}
            </span>
          </Link>
        </div>

        <nav className="flex items-center gap-4 relative z-10 mr-5">
          <Link
            href="/ai-generator"
            className="group flex items-center gap-2 px-4 py-2 transition-all relative text-black font-bold"
          >
            <span className="hidden sm:inline relative z-10">
              {t('ai.title')}
            </span>
            <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 pointer-events-none rotate-3">
              <WaveDecoration />
            </span>
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
