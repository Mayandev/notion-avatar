import { useTranslation } from 'next-i18next';
import Modal from '../Common';

type DownloadModalProps = {
  onCancel: () => void;
  image: string;
};

export default function DownloadModal({ onCancel, image }: DownloadModalProps) {
  const { t } = useTranslation(`common`);

  return (
    <Modal onCancel={onCancel}>
      <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
        <div className="flex flex-col items-center sm:flex-row">
          <div className="w-full flex justify-center">
            <img alt="notion avatar" src={image} className="w-64" />
          </div>
          <div className="h-full flex-col flex sm:justify-between mt-4 sm:mt-0">
            <div className="text-xl">🎉 {t(`modalTitle`)}</div>
            <div className=" text-gray-500 mt-2">{t(`modalHint`)}</div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
