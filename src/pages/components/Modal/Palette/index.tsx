import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import Modal from '../Common';
import { PalettePreset } from '@/const';

type PaletteModalProps = {
  onSelect: (color: string) => void;
  onCancel: () => void;
};

export default function PaletteModal({
  onSelect,
  onCancel,
}: PaletteModalProps) {
  const { t } = useTranslation();

  return (
    <Modal onCancel={onCancel}>
      <div className=" text-xl bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
        <h1>{t('paletteTitle')}</h1>
        <div className="mt-3 flex flex-wrap gap-4">
          {PalettePreset.map((color, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                onSelect(color);
                onCancel();
              }}
              className="w-16 h-12 rounded focus:ring-2 focus:ring-offset-2"
              style={{ background: color }}
            >
              {' '}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}
