import { AvatarConfig, ImageType } from '@/types';
import { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import Modal from '../Common';
import Code from '../../Code';

type EmbedModalProps = {
  onCancel: () => void;
  config: AvatarConfig;
  imageType: ImageType;
  isPremium?: boolean;
  onUpgrade?: () => void;
};

export default function EmbedModal({
  onCancel,
  config,
  isPremium = false,
  onUpgrade,
}: EmbedModalProps) {
  const [url, setUrl] = useState(``);
  const { t } = useTranslation();

  useEffect(() => {
    setUrl(
      `${process.env.NEXT_PUBLIC_URL}/api/svg/${btoa(JSON.stringify(config))}`,
    );
  }, []);

  return (
    <Modal onCancel={onCancel}>
      <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold mb-2 uppercase tracking-wide">
              URL
            </h2>
            <Code
              code={isPremium ? url : ''}
              placeholder="Upgrade to Pro to unlock embed URL"
              disabled={!isPremium}
            />
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2">{`<img>`}</h2>
            <Code
              code={isPremium ? `<img src="${url}" alt="notion avatar">` : ''}
              placeholder="Upgrade to Pro to unlock embed code"
              disabled={!isPremium}
            />
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2">Markdown</h2>
            <Code
              code={isPremium ? `![notion avatar](${url})` : ''}
              placeholder="Upgrade to Pro to unlock embed code"
              disabled={!isPremium}
            />
          </div>

          {!isPremium && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="bg-gray-50 rounded-lg p-6 text-center border-2 border-gray-200">
                <div className="mb-3">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-black rounded-full">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Pro Feature
                </h3>
                <p className="text-gray-600 mb-4 text-sm">
                  Unlock embed codes and get unlimited generations
                </p>
                {onUpgrade && (
                  <button
                    onClick={onUpgrade}
                    type="button"
                    className="px-6 py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Upgrade to Pro
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
