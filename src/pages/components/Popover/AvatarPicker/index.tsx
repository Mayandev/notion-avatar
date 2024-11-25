import { AvatarStyleCountExtra, FestivalTimeMapping } from '@/const';
import { AvatarPickerConfig } from '@/types';

import Image from 'next/legacy/image';
import { useTranslation } from 'next-i18next';
import { useLayoutEffect, useState } from 'react';
import { useClickOutside } from '@/hooks/useClickOutside';

type AvatarPickerProps = {
  avatarPart: AvatarPickerConfig;
  onSelect: (index: number) => void;
  onClose: () => void;
};

export default function AvatarPicker({
  avatarPart,
  onSelect,
  onClose,
}: AvatarPickerProps) {
  const { t } = useTranslation('common');

  const [translateX, setTranslateX] = useState<number | null>(null);

  useClickOutside(`#avatar-picker-${avatarPart.part}`, onClose);

  useLayoutEffect(() => {
    const element = document.querySelector('#popover');
    const { x } = element?.getBoundingClientRect() || { x: 0 };
    const pageWidth = window.innerWidth;

    setTranslateX(Math.max(10, Math.min((x / pageWidth) * 100, 90)));
  }, []);

  return (
    <div
      className="text-xl bg-white px-4 pt-2 pb-4 sm:p-6 sm:pb-4 text-left overflow-hidden absolute top-[120%] left-1/2 z-10 border rounded-lg shadow-xl sm:w-[32rem] hidden sm:block"
      style={{
        transform: `translateX(-${translateX}%)`,
      }}
      id="popover"
    >
      <h1 className="py-4 w-full">
        {t('Choose item', {
          item: t(`${avatarPart.part}`),
          choose: t('Choose'),
        })}
      </h1>
      <div className="h-auto max-h-72 overflow-auto">
        <div className="grid gap-8 grid-cols-4 p-2">
          {Array(Number(AvatarStyleCountExtra[avatarPart.part]) + 1)
            .fill(0)
            .map((zero, index) => (
              /* eslint-disable */
              <button
                type="button"
                className="w-14 h-14 p-2 outline-none select-none rounded-lg focus:ring-2 focus:ring-offset-2 focus:ring-black bg-white hover:bg-gray-50 border-3 "
                style={{
                  borderColor: `${
                    avatarPart.index === index ? 'black' : 'transparent'
                  }`,
                }}
                onClick={() => {
                  onSelect(index);
                }}
                key={index}
              >
                <div className="flex justify-center items-center">
                  <Image
                    src={
                      Object.keys(FestivalTimeMapping).includes(avatarPart.part)
                        ? `/avatar/part/festival/${avatarPart.part}/${avatarPart.part}-${index}.svg`
                        : `/avatar/part/${avatarPart.part}/${avatarPart.part}-${index}.svg`
                    }
                    width={50}
                    height={50}
                  />
                </div>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
