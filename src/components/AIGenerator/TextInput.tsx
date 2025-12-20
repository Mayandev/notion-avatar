import { useTranslation } from 'next-i18next';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function TextInput({
  value,
  onChange,
  disabled,
}: TextInputProps) {
  const { t } = useTranslation('common');

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t('ai.descPlaceholder')}
          disabled={disabled}
          className={`w-full h-40 p-6 rounded-2xl border-3 resize-none outline-none text-lg font-medium transition-colors ${
            disabled
              ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-white border-gray-200 focus:border-black text-gray-800'
          }`}
        />
        <div className="absolute bottom-4 right-4 text-xs text-gray-400 font-bold">
          {value.length}/500
        </div>
      </div>
    </div>
  );
}
