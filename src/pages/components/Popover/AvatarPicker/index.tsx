import { AvatarStyleCountExtra, FestivalTimeMapping } from '@/const';
import { AvatarPickerConfig } from '@/types';

import Image from 'next/legacy/image';
import { useTranslation } from 'next-i18next';
import { useEffect } from 'react';

type AvatarPickerProps = {
  avatarPart: AvatarPickerConfig;
  offsetLeft: number;
  onSelect: (index: number) => void;
  onClose: () => void;
};

export default function AvatarPicker({
  avatarPart,
  offsetLeft,
  onSelect,
  onClose,
}: AvatarPickerProps) {
  const { t } = useTranslation('common');

  useEffect(() => {
    function handleClose(e: MouseEvent) {
      const element = document.querySelector(
        `#avatar-picker-${avatarPart.part}`,
      );

      if (element && !element.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('click', handleClose);

    return () => {
      document.removeEventListener('click', handleClose);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="text-xl bg-white px-4 pt-2 pb-4 sm:p-6 sm:pb-4 absolute top-[120%] left-1/2 z-10 border rounded-lg text-left overflow-hidden shadow-xl sm:w-[32rem]"
      style={{
        transform: `translateX(-${offsetLeft}%)`,
      }}
      // id={`avatar-picker-${avatarPart.part}`}
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
