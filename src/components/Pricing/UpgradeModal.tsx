import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import { useAuth } from '@/contexts/AuthContext';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
}

export default function UpgradeModal({
  isOpen,
  onClose,
  onLoginClick,
}: UpgradeModalProps) {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePurchase = async (
    priceType: 'monthly' | 'yearly' | 'credits',
  ) => {
    if (!user) {
      onClose();
      onLoginClick();
      return;
    }

    setIsLoading(priceType);

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceType }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout');
      }
    } catch {
      toast.error(t('pricing.upgradeModal.checkoutError'));
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        role="button"
        tabIndex={0}
        aria-label="Close modal"
      />

      {/* Modal */}
      <div className="relative bg-[#fffefc] border-3 border-black rounded-lg p-8 w-full max-w-lg mx-4 animate-in fade-in zoom-in duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <path strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {t('pricing.upgradeModal.title')}
          </h2>
          <p className="text-gray-500 mt-2">
            {t('pricing.upgradeModal.description')}
          </p>
        </div>

        <div className="space-y-3">
          {/* Pro Yearly - Recommended */}
          <button
            onClick={() => handlePurchase('yearly')}
            disabled={isLoading !== null}
            type="button"
            className="w-full p-4 border-3 border-black bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">
                    {t('pricing.upgradeModal.proYearly')}
                  </span>
                  <span className="bg-white text-black text-xs font-bold px-2 py-0.5 rounded-full">
                    {t('pricing.upgradeModal.proYearlySave')}
                  </span>
                </div>
                <p className="text-gray-300 text-sm mt-1">
                  {t('pricing.upgradeModal.unlimitedGenerations')}
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold">
                  {t('pricing.upgradeModal.proYearlyPrice')}
                </span>
                <span className="text-gray-300 text-sm">
                  {t('pricing.upgradeModal.proYearlyPeriod')}
                </span>
              </div>
            </div>
            {isLoading === 'yearly' && (
              <div className="mt-2 text-center text-sm text-gray-300">
                {t('pricing.upgradeModal.redirecting')}
              </div>
            )}
          </button>

          {/* Pro Monthly */}
          <button
            onClick={() => handlePurchase('monthly')}
            disabled={isLoading !== null}
            type="button"
            className="w-full p-4 border-3 border-black rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-lg">
                  {t('pricing.upgradeModal.proMonthly')}
                </span>
                <p className="text-gray-500 text-sm mt-1">
                  {t('pricing.upgradeModal.unlimitedGenerations')}
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold">
                  {t('pricing.upgradeModal.proPrice')}
                </span>
                <span className="text-gray-500 text-sm">
                  {t('pricing.upgradeModal.proPeriod')}
                </span>
              </div>
            </div>
            {isLoading === 'monthly' && (
              <div className="mt-2 text-center text-sm text-gray-500">
                {t('pricing.upgradeModal.redirecting')}
              </div>
            )}
          </button>

          {/* Credit Pack */}
          <button
            onClick={() => handlePurchase('credits')}
            disabled={isLoading !== null}
            type="button"
            className="w-full p-4 border-3 border-black rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-lg">
                  {t('pricing.upgradeModal.creditPack')}
                </span>
                <p className="text-gray-500 text-sm mt-1">
                  {t('pricing.upgradeModal.creditPackDesc')}
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold">
                  {t('pricing.upgradeModal.creditPackPrice')}
                </span>
                <span className="text-gray-500 text-sm">
                  {t('pricing.upgradeModal.creditPackPeriod')}
                </span>
              </div>
            </div>
            {isLoading === 'credits' && (
              <div className="mt-2 text-center text-sm text-gray-500">
                {t('pricing.upgradeModal.redirecting')}
              </div>
            )}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          {t('pricing.upgradeModal.resetInfo')}
        </p>
      </div>
    </div>
  );
}
