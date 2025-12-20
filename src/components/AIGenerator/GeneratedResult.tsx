import { useTranslation } from 'next-i18next';

interface GeneratedResultProps {
  image: string;
  onDownload: () => void;
  onReset: () => void;
}

export default function GeneratedResult({
  image,
  onDownload,
  onReset,
}: GeneratedResultProps) {
  const { t } = useTranslation('common');

  return (
    <div className="flex flex-col items-center animate-in zoom-in-95 duration-500">
      <div className="relative w-64 h-64 md:w-80 md:h-80 bg-white rounded-2xl shadow-xl border-4 border-black mb-8 overflow-hidden group">
        <div className="absolute inset-0 bg-[#fffefc] pattern-grid-lg opacity-10" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt="Generated Avatar"
          className="w-full h-full object-contain p-4"
        />
      </div>

      <div className="flex gap-4 w-full max-w-md">
        <button
          type="button"
          onClick={onReset}
          className="flex-1 py-3 px-6 rounded-full border-3 border-gray-200 text-gray-600 font-bold hover:border-black hover:text-black transition-colors"
        >
          Try Again
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
    </div>
  );
}
