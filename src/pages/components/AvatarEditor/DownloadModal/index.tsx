import { useTranslation } from 'next-i18next';

type ModalProps = {
  image: string;
  onCancel: () => void;
};

export default function DownloadModal({ image, onCancel }: ModalProps) {
  const { t } = useTranslation(`common`);

  return (
    <div
      className="fixed z-10 inset-0"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-36 text-center sm:block sm:p-0">
        <div
          className="absolute inset-0 bg-black bg-opacity-75 transition-opacity"
          aria-hidden="true"
        />

        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex flex-col items-center sm:flex-row">
              <div className="w-full flex justify-center">
                <img src={image} className="w-64" />
              </div>
              <div className="h-full flex-col flex sm:justify-between mt-4 sm:mt-0">
                <div className="text-xl">🎉 {t(`modalTitle`)}</div>
                <div className=" text-gray-500 mt-2">{t(`modalHint`)}</div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              onClick={onCancel}
              type="button"
              className="mt-3 w-full font-bold inline-flex justify-center rounded-md border-black border-3 shadow-sm px-4 py-2 bg-white text-base hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black sm:mt-0 sm:ml-3 sm:w-auto"
            >
              {t(`modalCancel`)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
