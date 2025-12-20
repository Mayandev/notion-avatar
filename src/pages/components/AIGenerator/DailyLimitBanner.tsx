import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

interface DailyLimitBannerProps {
  remaining: number;
  total: number;
  isUnlimited: boolean;
}

export default function DailyLimitBanner({
  remaining,
  total,
  isUnlimited,
}: DailyLimitBannerProps) {
  const { t } = useTranslation('common');
  const router = useRouter();

  if (isUnlimited || remaining > 0) {
    return (
      <div className="text-center text-sm text-gray-500 mt-6">
        Remaining free generations today:{' '}
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
