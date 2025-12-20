import { useTranslation } from 'next-i18next';

export default function GeneratingStatus() {
  const { t } = useTranslation('common');

  return (
    <div className="flex flex-col items-center justify-center py-12 animate-in fade-in duration-500">
      <div className="relative w-24 h-24 mb-6">
        <div className="absolute inset-0 border-4 border-gray-100 rounded-full" />
        <div className="absolute inset-0 border-4 border-black rounded-full border-t-transparent animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl animate-pulse">✨</span>
        </div>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {t('ai.generating')}
      </h3>
      <p className="text-gray-500 text-sm max-w-xs text-center">
        Creating your unique Notion avatar...
      </p>
    </div>
  );
}
