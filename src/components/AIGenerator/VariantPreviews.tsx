import { useTranslation } from 'next-i18next';

interface VariantPreviewsProps {
  onUpgradeClick: () => void;
}

export default function VariantPreviews({
  onUpgradeClick,
}: VariantPreviewsProps) {
  const { t } = useTranslation('common');

  const variants = [
    '/examples/variant-1.png',
    '/examples/variant-2.png',
    '/examples/variant-3.png',
    '/examples/variant-4.png',
  ];

  return (
    <div className="w-full max-w-md mt-8">
      <p className="text-center text-sm font-medium text-gray-500 mb-3">
        {t('ai.unlockStyles')}
      </p>
      <div className="grid grid-cols-4 gap-3">
        {variants.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={onUpgradeClick}
            className="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200 hover:border-black transition-colors cursor-pointer group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`Style variant ${i + 1}`}
              className="w-full h-full object-cover blur-[6px] group-hover:blur-[4px] transition-all"
            />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white opacity-80"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
