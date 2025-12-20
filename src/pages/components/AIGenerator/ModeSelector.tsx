import { AIGenerationMode } from '@/types/ai';
import { useTranslation } from 'next-i18next';

interface ModeSelectorProps {
  currentMode: AIGenerationMode;
  onModeChange: (mode: AIGenerationMode) => void;
  disabled?: boolean;
}

export default function ModeSelector({
  currentMode,
  onModeChange,
  disabled,
}: ModeSelectorProps) {
  const { t } = useTranslation('common');

  return (
    <div className="flex p-1 bg-gray-100 rounded-full mb-8 max-w-md mx-auto">
      <button
        type="button"
        onClick={() => onModeChange('photo2avatar')}
        disabled={disabled}
        className={`flex-1 py-2 px-6 rounded-full text-sm font-bold transition-all duration-200 ${
          currentMode === 'photo2avatar'
            ? 'bg-black text-white shadow-sm'
            : 'text-gray-500 hover:text-black'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        📸 {t('ai.photo2avatar')}
      </button>
      <button
        type="button"
        onClick={() => onModeChange('text2avatar')}
        disabled={disabled}
        className={`flex-1 py-2 px-6 rounded-full text-sm font-bold transition-all duration-200 ${
          currentMode === 'text2avatar'
            ? 'bg-black text-white shadow-sm'
            : 'text-gray-500 hover:text-black'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        ✨ {t('ai.text2avatar')}
      </button>
    </div>
  );
}
