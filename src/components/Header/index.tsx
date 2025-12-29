import { useState, useEffect } from 'react';
import Image from 'next/legacy/image';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import UserMenu from '@/components/Auth/UserMenu';
import AuthModal from '@/components/Auth/AuthModal';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useAuth } from '@/contexts/AuthContext';
import Decoration, { WaveDecoration } from './decoration';

export default function Header() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { user, subscription, credits, signOut, isLoading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

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

        {/* Desktop Navigation */}
        <nav className="hidden sm:flex items-center gap-4 relative z-10 mr-5">
          <Link
            href="/ai-generator"
            className="group flex items-center gap-2 px-4 py-2 transition-all relative text-black font-bold"
          >
            <span className="relative z-10">{t('ai.navTitle')}</span>
            <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 pointer-events-none rotate-3">
              <WaveDecoration />
            </span>
          </Link>
          <LanguageSwitcher />
          <UserMenu onLoginClick={() => setIsAuthModalOpen(true)} />
        </nav>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className="sm:hidden p-2 rounded-lg bg-white/90 backdrop-blur-sm hover:bg-gray-100 active:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 relative z-10 shadow-sm"
          aria-label={t('menu.open')}
          aria-expanded={isMobileMenuOpen}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-black"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Mobile Sidebar */}
        <div
          className={`fixed inset-0 z-50 sm:hidden ${
            isMobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
        >
          {/* Backdrop */}
          <div
            role="button"
            tabIndex={0}
            className={`fixed inset-0 bg-black transition-opacity duration-300 ease-in-out ${
              isMobileMenuOpen ? 'opacity-50' : 'opacity-0'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
                setIsMobileMenuOpen(false);
              }
            }}
            aria-label={t('menu.close')}
          />

          {/* Sidebar */}
          <div
            className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
              isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
            role="dialog"
            aria-modal="true"
            aria-label={t('menu.navigation')}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-200">
                <h2 className="text-xl font-bold text-black">
                  {t('menu.title')}
                </h2>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                  aria-label={t('menu.close')}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-black"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 overflow-y-auto p-5 space-y-1">
                {/* Home Link */}
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 transition-all text-black font-bold rounded-lg hover:bg-gray-50 active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  <span>{t('menu.home')}</span>
                </Link>

                {/* AI Generator Link */}
                <Link
                  href="/ai-generator"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="group flex items-center gap-3 px-4 py-3 transition-all relative text-black font-bold rounded-lg hover:bg-gray-50 active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                >
                  <Image
                    src="/icon/ai-stars.svg"
                    alt="AI Stars"
                    width={20}
                    height={20}
                    className="drop-shadow-sm"
                  />
                  <span className="relative z-10">{t('ai.title')}</span>
                </Link>

                {/* Language Switcher */}
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm font-semibold text-gray-700">
                      {t('language')}
                    </span>
                    <LanguageSwitcher />
                  </div>
                </div>

                {/* User Settings - Flat Layout */}
                <div className="pt-4 border-t border-gray-200">
                  {isLoading ? (
                    <div className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-24 mb-2" />
                          <div className="h-3 bg-gray-200 rounded animate-pulse w-32" />
                        </div>
                      </div>
                    </div>
                  ) : !user ? (
                    <div className="px-4 py-3">
                      <button
                        onClick={() => {
                          setIsAuthModalOpen(true);
                          setIsMobileMenuOpen(false);
                        }}
                        type="button"
                        className="w-full px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        {t('menu.signIn')}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                          {user.user_metadata?.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={user.user_metadata.avatar_url}
                              alt="Avatar"
                              className="w-10 h-10 rounded-full border border-gray-200"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white text-sm font-medium">
                              {(
                                user.user_metadata?.full_name ||
                                user.user_metadata?.name ||
                                user.email
                              )
                                ?.charAt(0)
                                .toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {user.user_metadata?.full_name ||
                                user.user_metadata?.name ||
                                user.email}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              subscription?.plan_type === 'monthly' ||
                              subscription?.plan_type === 'yearly'
                                ? 'bg-black text-white'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {subscription?.plan_type === 'monthly' ||
                            subscription?.plan_type === 'yearly'
                              ? t('menu.pro')
                              : t('menu.free')}
                          </span>
                          {credits > 0 && (
                            <span className="text-xs text-gray-500">
                              {credits} {t('menu.credits')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <Link
                          href="/account"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          {t('menu.accountSettings')}
                        </Link>
                        <Link
                          href="/pricing"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          {t('menu.upgradePlan')}
                        </Link>
                      </div>

                      {/* Sign Out */}
                      <div className="border-t border-gray-100 pt-1">
                        <button
                          onClick={() => {
                            signOut();
                            setIsMobileMenuOpen(false);
                          }}
                          type="button"
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          {t('menu.signOut')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </nav>
            </div>
          </div>
        </div>
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
