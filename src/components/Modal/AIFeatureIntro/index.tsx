import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import Image from 'next/legacy/image';

interface AIFeatureIntroModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDontShowAgain?: () => void;
}

export default function AIFeatureIntroModal({
  isOpen,
  onClose,
  onDontShowAgain,
}: AIFeatureIntroModalProps) {
  const { t } = useTranslation('common');
  const router = useRouter();

  if (!isOpen) return null;

  const handleTryNow = () => {
    onClose();
    router.push('/ai-generator');
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
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg mx-4 animate-in fade-in zoom-in duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <svg
            className="w-6 h-6"
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

        {/* Content */}
        <div className="text-center">
          {/* Title */}
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t('aiFeatureIntro.title')}
          </h2>

          {/* Description */}
          <p className="text-gray-600 mb-6 leading-relaxed">
            {t('aiFeatureIntro.description')}
          </p>

          <div className="my-8">
            <Image
              src="/image/avatar-diff.png"
              alt="Notion AI Avatar"
              width={512}
              height={242}
              priority
            />
          </div>

          {/* Features */}
          <div className="space-y-3 mb-8 text-left">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-black flex items-center justify-center text-white text-sm font-bold mt-0.5">
                1
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {t('aiFeatureIntro.feature1Title')}
                </p>
                <p className="text-sm text-gray-600">
                  {t('aiFeatureIntro.feature1Desc')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-black flex items-center justify-center text-white text-sm font-bold mt-0.5">
                2
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {t('aiFeatureIntro.feature2Title')}
                </p>
                <p className="text-sm text-gray-600">
                  {t('aiFeatureIntro.feature2Desc')}
                </p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleTryNow}
              type="button"
              className="flex-1 py-3 px-6 rounded-full bg-black text-white font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-xl"
            >
              {t('aiFeatureIntro.tryNow')}
            </button>
            {onDontShowAgain && (
              <button
                onClick={onDontShowAgain}
                type="button"
                className="py-3 px-6 rounded-full bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
              >
                {t('aiFeatureIntro.dontShowAgain')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
