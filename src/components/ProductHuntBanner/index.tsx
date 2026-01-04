import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

const PH_BANNER_DISMISSED_KEY = 'ph-promo-banner-dismissed';

const PROMO_CODES = ['XKZQWM'];

export default function ProductHuntBanner() {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 检查是否已经关闭过
    const dismissed = localStorage.getItem(PH_BANNER_DISMISSED_KEY);
    if (dismissed) return;

    // 检查 URL 参数或 referrer
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    const { referrer } = document;

    const isFromProductHunt =
      ref === 'producthunt' ||
      ref === 'ph' ||
      referrer.includes('producthunt.com');

    if (isFromProductHunt) {
      setIsVisible(true);
      // 记录来源，即使刷新页面也显示 banner
      sessionStorage.setItem('from-producthunt', 'true');
    } else if (sessionStorage.getItem('from-producthunt') === 'true') {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(PH_BANNER_DISMISSED_KEY, 'true');
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(t('copied'));
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gray-100 text-gray-900 border-b border-gray-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <span className="text-xl hidden sm:inline">🎉</span>
            <div className="flex-1">
              <p className="font-medium text-sm sm:text-base">
                {t('productHunt.welcome')}
              </p>
              <div className="text-xs sm:text-sm text-gray-600 flex flex-wrap items-center gap-1">
                <span>{t('productHunt.promoMessage')}</span>
                <span className="flex flex-wrap gap-1">
                  {PROMO_CODES.map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => handleCopyCode(code)}
                      className="font-bold bg-white px-2 py-0.5 rounded hover:bg-gray-50 transition-colors border border-gray-300"
                      title={t('copy')}
                    >
                      {code}
                    </button>
                  ))}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <Link
                href="/account"
                className="px-3 py-1.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap"
              >
                {t('productHunt.redeemNow')}
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className="px-3 py-1.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap"
              >
                {t('productHunt.signInToRedeem')}
              </Link>
            )}
            <button
              type="button"
              onClick={handleDismiss}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              aria-label="Dismiss"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
