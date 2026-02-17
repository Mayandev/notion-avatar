import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

interface DailyLimitBannerProps {
  remaining: number;
  total: number;
  isUnlimited: boolean;
  freeRemaining?: number;
  paidCredits?: number;
}

export default function DailyLimitBanner({
  remaining,
  total,
  isUnlimited,
  freeRemaining,
  paidCredits,
}: DailyLimitBannerProps) {
  const { t } = useTranslation('common');
  const router = useRouter();

  if (isUnlimited) {
    return (
      <div className="text-center text-sm text-gray-500 mt-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full font-medium">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Pro Plan - Unlimited Generations
        </span>
      </div>
    );
  }

  if (remaining > 0) {
    // If user has paid credits, show total available
    if (paidCredits && paidCredits > 0) {
      return (
        <div className="text-center text-sm text-gray-500 mt-6">
          <span className="font-bold text-black">{remaining}</span> generations
          available
          {freeRemaining !== undefined && freeRemaining > 0 && (
            <span className="text-gray-400">
              {' '}
              ({freeRemaining} free this week + {paidCredits} credits)
            </span>
          )}
        </div>
      );
    }

    // Only free generations
    return (
      <div className="text-center text-sm text-gray-500 mt-6">
        Remaining free generations this week:{' '}
        <span className="font-bold text-black">
          {remaining}/{total}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
      <h4 className="font-bold text-gray-900 mb-1">{t('ai.limitReached')}</h4>
      <p className="text-sm text-gray-500 mb-3">{t('ai.limitDesc')}</p>
      <button
        type="button"
        onClick={() => router.push('/pricing')} // Assuming pricing page exists or will be added
        className="text-sm font-bold text-black border-b-2 border-black hover:border-transparent transition-colors"
      >
        {t('ai.upgrade')} →
      </button>
    </div>
  );
}
