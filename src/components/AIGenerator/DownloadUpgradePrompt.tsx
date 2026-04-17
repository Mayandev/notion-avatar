import { useTranslation } from 'next-i18next';

interface DownloadUpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  onDownloadAnyway: () => void;
}

export default function DownloadUpgradePrompt({
  isOpen,
  onClose,
  onUpgrade,
  onDownloadAnyway,
}: DownloadUpgradePromptProps) {
  const { t } = useTranslation('common');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        role="button"
        tabIndex={0}
        aria-label="Close"
      />

      <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4 animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
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

        <div className="text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {t('ai.downloadUpgrade.title')}
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            {t('ai.downloadUpgrade.description')}
          </p>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={onUpgrade}
            className="w-full py-3 px-4 rounded-xl bg-black text-white font-bold hover:bg-gray-800 transition-colors"
          >
            {t('ai.downloadUpgrade.upgrade')}
          </button>
          <button
            type="button"
            onClick={onDownloadAnyway}
            className="w-full py-3 px-4 rounded-xl border-2 border-gray-200 text-gray-600 font-medium hover:border-gray-300 transition-colors"
          >
            {t('ai.downloadUpgrade.dismiss')}
          </button>
        </div>
      </div>
    </div>
  );
}
