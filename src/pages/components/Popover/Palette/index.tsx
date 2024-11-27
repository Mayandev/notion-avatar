import { useTranslation } from 'next-i18next';
import { PalettePreset, DefaultBackgroundConfig } from '@/const';
import { AvatarBackgroundConfig, BackgroundShape } from '@/types';
import { useEffect, useState } from 'react';
import Popover from '../Common';

type PalettePopoverProps = {
  onSelect: (background: AvatarBackgroundConfig) => void;
  onClose: () => void;
  backgroundConfig: AvatarBackgroundConfig;
  triggerId: string;
};

export default function PalettePopover({
  onSelect,
  onClose,
  backgroundConfig = DefaultBackgroundConfig,
  triggerId,
}: PalettePopoverProps) {
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

  useEffect(() => {
    onSelect({ shape: bgShape, color: bgColor });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bgShape, bgColor]);

  return (
    <Popover triggerId={triggerId} onClose={onClose}>
      <>
        <h1 className="py-4 w-full flex justify-between items-center">
          {t('chooseShape')}{' '}
          <button
            onClick={onClose}
            type="button"
            className="font-bold inline-flex justify-center rounded-md border-black border-3 shadow-sm px-4 py-2 bg-white text-base hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black sm:hidden"
          >
            {t('modalCancel')}
          </button>
        </h1>
        <div>
          <button
            type="button"
            onClick={() => {
              setBackgroundShape('square');
            }}
            className={`bg-gray-400 rounded w-8 h-8 focus:outline-none mr-6 ${
              backgroundConfig.shape === 'square' &&
              'ring-2 ring-offset-2 ring-gray-400'
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
              backgroundConfig.shape === 'circle' &&
              'ring-2 ring-offset-2 ring-gray-400'
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
      </>
    </Popover>
  );
}
