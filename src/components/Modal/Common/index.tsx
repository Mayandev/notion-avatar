import { useTranslation } from 'next-i18next';

type ModalProps = {
  onCancel: () => void;
  onConfirm?: (...args: any[]) => void;
  children: JSX.Element;
};

export default function Modal({ onCancel, children, onConfirm }: ModalProps) {
  const { t } = useTranslation('common');

  return (
    <div
      className="fixed z-10 inset-0"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-56 text-center sm:block sm:p-0">
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
          {children}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            {onConfirm && (
              <button
                onClick={onConfirm}
                type="button"
                className="mt-3 w-full font-bold inline-flex justify-center rounded-md border-black border-3 shadow-sm px-4 py-2 bg-black text-white text-base focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black sm:mt-0 sm:ml-3 sm:w-auto"
              >
                {t('modalConfirm')}
              </button>
            )}
            <button
              onClick={onCancel}
              type="button"
              className="mt-3 w-full font-bold inline-flex justify-center rounded-md border-black border-3 shadow-sm px-4 py-2 bg-white text-base hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black sm:mt-0 sm:ml-3 sm:w-auto"
            >
              {t('modalCancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
