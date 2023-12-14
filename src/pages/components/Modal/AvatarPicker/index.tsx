import {
  AvatarStyleCountExtra,
  DefaultAvatarPickerConfig,
  FestivalTimeMapping,
} from '@/const';
import { AvatarPickerConfig } from '@/types';
import { isFestival } from '@/utils';

import Image from 'next/legacy/image';
import { useState } from 'react';
import { useTranslation } from 'next-i18next';

import Modal from '../Common';

type AvatarPickerProps = {
  onCancel: () => void;
  avatarPart: AvatarPickerConfig;
  onConfirm: (index: number) => void;
};

export default function AvatarPicker({
  onCancel,
  avatarPart = DefaultAvatarPickerConfig,
  onConfirm,
}: AvatarPickerProps) {
  const { t } = useTranslation('common');
  const [currentIndex, setCurrentIndex] = useState<number>(avatarPart.index);
  return (
    <Modal onCancel={onCancel} onConfirm={() => onConfirm(currentIndex)}>
      <div className="text-xl bg-white px-4 pt-2 pb-4 sm:p-6 sm:pb-4">
        <h1 className="py-4 w-full">
          {t('Choose item', {
            item: t(`${avatarPart.part}`),
            choose: t('Choose'),
          })}
        </h1>
        <div className="h-auto max-h-72 overflow-scroll">
          <div className="grid gap-8 grid-cols-4 p-2">
            {Array(Number(AvatarStyleCountExtra[avatarPart.part]) + 1)
              .fill(0)
              .map((zero, index) => (
                /* eslint-disable */
                <button
                  type="button"
                  className={`w-14 h-14 p-2 outline-none select-none rounded-lg focus:ring-2 focus:ring-offset-2 focus:ring-black bg-white hover:bg-gray-50 ${
                    currentIndex === index && 'border-black border-3'
                  } `}
                  onClick={() => {
                    setCurrentIndex(index);
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
      </div>
    </Modal>
  );
}
