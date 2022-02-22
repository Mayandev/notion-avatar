import { useTranslation } from 'next-i18next';
import { PalettePreset, DefaultBackgroundConfig } from '@/const';
import { AvatarBackgroundConfig, BackgroundShape } from '@/types';
import { useState } from 'react';
import Modal from '../Common';

type PaletteModalProps = {
  onSelect: (background: AvatarBackgroundConfig) => void;
  onCancel: () => void;
  backgroundConfig: AvatarBackgroundConfig;
};

export default function PaletteModal({
  onSelect,
  onCancel,
  backgroundConfig = DefaultBackgroundConfig,
}: PaletteModalProps) {
  const { t } = useTranslation();
  const [bgShape, setShape] = useState<BackgroundShape>(backgroundConfig.shape);
  const [bgColor, setColor] = useState<string>(backgroundConfig.color);

  const setBackgroundShape = (shape: BackgroundShape) => {
    if (shape === bgShape) {
      setShape(DefaultBackgroundConfig.shape);
      return;
    }
    setShape(shape);
  };

  const setBackgroundColor = (color: string) => {
    if (bgColor === color) {
      setColor(DefaultBackgroundConfig.color);
      return;
    }
    setColor(color);
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBackgroundColor(e.target.value);
  };

  return (
    <Modal
      onCancel={onCancel}
      onConfirm={() => {
        onSelect({ shape: bgShape, color: bgColor });
      }}
    >
      <div className="text-xl bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
        <h1 className="py-4 w-full">{t('chooseShape')}</h1>
        <div>
          <button
            type="button"
            onClick={() => {
              setBackgroundShape('square');
            }}
            className={`bg-gray-400 rounded w-8 h-8 focus:outline-none mr-6 ${
              bgShape === 'square' && 'ring-2 ring-offset-2 ring-gray-400'
            }`}
          >
            {' '}
          </button>
          <button
            type="button"
            onClick={() => {
              setBackgroundShape('circle');
            }}
            className={`bg-gray-400 rounded-full w-8 h-8 focus:outline-none ${
              bgShape === 'circle' && 'ring-2 ring-offset-2 ring-gray-400'
            }`}
          >
            {' '}
          </button>
        </div>

        <h1 className="py-4">{t('paletteTitle')}</h1>
        <div className="grid gap-2 p-1 sm:gap-4 justify-items-center justify-between grid-rows-2 grid-cols-5">
          {PalettePreset.map((color, index) => (
            /* eslint-disable */
            <button
              key={index}
              type="button"
              onClick={() => {
                setBackgroundColor(color);
              }}
              className={`w-12 h-10 sm:w-20 sm:h-12 rounded outline-none select-none border-3 border-solid border-black ${
                color === bgColor && 'ring-2 ring-offset-2 ring-black'
              }`}
              style={{ background: color }}
            >
              {' '}
            </button>
          ))}
        </div>

        <div className="flex items-center">
          <h1 className="py-4">{t('customColor')}</h1>
          <input
            defaultValue={backgroundConfig.color}
            onChange={handleColorChange}
            className="ml-2 border-gray-400 border-1 rounded bg-gray-200"
            type="color"
          ></input>
        </div>
      </div>
    </Modal>
  );
}
