import { AvatarStyleCountExtra, FestivalTimeMapping } from '@/const';
import { AvatarPickerConfig } from '@/types';

import Image from 'next/legacy/image';
import { useTranslation } from 'next-i18next';
import Popover from '../Common';

type AvatarPickerPopoverProps = {
  avatarPart: AvatarPickerConfig;
  onSelect: (index: number) => void;
  onClose: () => void;
  triggerId: string;
};

export default function AvatarPickerPopover({
  avatarPart,
  onSelect,
  onClose,
  triggerId,
}: AvatarPickerPopoverProps) {
  const { t } = useTranslation('common');

  if (!avatarPart) return null;

  return (
    <Popover triggerId={triggerId} onClose={onClose}>
      <>
        <h1 className="py-4 w-full flex justify-between items-center">
          {t('Choose item', {
            item: t(`${avatarPart.part}`),
            choose: t('Choose'),
          })}
          <button
            onClick={onClose}
            type="button"
            className="font-bold inline-flex justify-center rounded-md border-black border-3 shadow-sm px-4 py-2 bg-white text-base hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black sm:hidden"
          >
            {t('modalCancel')}
          </button>
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
                        Object.keys(FestivalTimeMapping).includes(
                          avatarPart.part,
                        )
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
      </>
    </Popover>
  );
}
