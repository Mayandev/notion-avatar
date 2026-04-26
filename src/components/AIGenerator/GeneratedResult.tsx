import { useTranslation } from 'next-i18next';
import VariantPreviews from './VariantPreviews';

interface GeneratedResultProps {
  image: string;
  onDownload: () => void;
  onReset: () => void;
  remaining?: number;
  total?: number;
  isUnlimited?: boolean;
  isPaidUser?: boolean;
  onUpgradeClick: () => void;
}

export default function GeneratedResult({
  image,
  onDownload,
  onReset,
  remaining,
  isUnlimited,
  isPaidUser,
  onUpgradeClick,
}: GeneratedResultProps) {
  const { t } = useTranslation('common');

  return (
    <div className="flex flex-col items-center animate-in zoom-in-95 duration-500">
      {/* Remaining count */}
      {!isUnlimited && remaining !== undefined && (
        <div
          className={`mb-4 text-sm font-medium px-4 py-2 rounded-full ${
            remaining > 0
              ? 'bg-green-50 text-green-700'
              : 'bg-orange-50 text-orange-700'
          }`}
        >
          {remaining > 0
            ? t('ai.remainingGenerations', { remaining })
            : t('ai.weeklyLimitUsed')}
          {remaining === 0 && (
            <button
              type="button"
              onClick={onUpgradeClick}
              className="ml-2 underline font-bold hover:no-underline"
            >
              {t('ai.upgrade')}
            </button>
          )}
        </div>
      )}

      <div className="relative w-64 h-64 md:w-80 md:h-80 bg-white rounded-2xl shadow-xl border-4 border-black mb-8 overflow-hidden group">
        <div className="absolute inset-0 bg-[#fffefc] pattern-grid-lg opacity-10" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt="Generated Avatar"
          className="w-full h-full object-contain p-4"
        />
      </div>

      {/* Watermark hint for free users */}
      {!isPaidUser && (
        <p className="text-xs text-gray-400 mb-4 text-center">
          {t('ai.watermarkHint')}
        </p>
      )}

      <div className="flex gap-4 w-full max-w-md">
        <button
          type="button"
          onClick={onReset}
          className="flex-1 py-3 px-6 rounded-full border-3 border-gray-200 text-gray-600 font-bold hover:border-black hover:text-black transition-colors"
        >
          {t('ai.tryAgain')}
        </button>
        <button
          type="button"
          onClick={onDownload}
          className="flex-1 py-3 px-6 rounded-full bg-black text-white font-bold border-3 border-black hover:bg-gray-800 hover:border-gray-800 transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {t('ai.download')}
        </button>
      </div>

      {/* Variant previews for free users */}
      {/* {!isPaidUser && <VariantPreviews onUpgradeClick={onUpgradeClick} />} */}
    </div>
  );
}
