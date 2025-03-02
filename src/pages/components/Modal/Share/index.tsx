import { useTranslation } from 'next-i18next';
import Image from 'next/legacy/image';
import toast from 'react-hot-toast';
import Modal from '../Common';

type ShareModalProps = {
  onCancel: () => void;
  image: string;
};

export default function ShareModal({ onCancel, image }: ShareModalProps) {
  const { t } = useTranslation('common');

  const shareToX = () => {
    const text = t('shareContent');
    const url = window.location.href;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        text,
      )}&url=${encodeURIComponent(url)}`,
      '_blank',
    );
  };

  const shareToFacebook = () => {
    const url = window.location.href;
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      '_blank',
    );
  };

  const shareToInstagram = async () => {
    try {
      const text = `${t('shareContent')}\n${window.location.href}`;
      await navigator.clipboard.writeText(text);
      toast.success(t('copied'), {
        duration: 2000,
        position: 'bottom-center',
        style: {
          background: '#333',
          color: '#fff',
          borderRadius: '24px',
        },
      });
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast.error(t('copyFailed'));
    }
  };

  const shareToReddit = () => {
    const text = t('shareContent');
    const url = window.location.href;
    window.open(
      `https://www.reddit.com/submit?title=${encodeURIComponent(
        text,
      )}&url=${encodeURIComponent(url)}`,
      '_blank',
    );
  };

  const shareToTikTok = async () => {
    try {
      const text = `${t('shareContent')}\n${window.location.href}`;
      await navigator.clipboard.writeText(text);
      toast.success(t('copied'), {
        duration: 2000,
        position: 'bottom-center',
        style: {
          background: '#333',
          color: '#fff',
          borderRadius: '24px',
        },
      });
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast.error(t('copyFailed'));
    }
  };

  return (
    <Modal onCancel={onCancel}>
      <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
        <div className="flex flex-col items-center sm:flex-row">
          <div className="w-full flex justify-center flex-1">
            <img alt="notion avatar" src={image} className="w-64" />
          </div>
          <div className="h-full flex-col flex sm:justify-between mt-4 sm:mt-0">
            <div className="text-xl">🎉 {t('downloadSuccess')}</div>
            <div className="text-gray-500 mt-2">{t('shareModalHint')}</div>
            <div className="flex gap-4 mt-6 relative">
              <Image
                src="/icon/x-logo.svg"
                alt="X"
                width={24}
                height={24}
                className="mr-2 hover:cursor-pointer"
                onClick={shareToX}
              />
              <Image
                src="/icon/facebook-logo.svg"
                alt="Facebook"
                width={24}
                height={24}
                className="mr-2 hover:cursor-pointer"
                onClick={shareToFacebook}
              />
              <Image
                src="/icon/ins-logo.svg"
                alt="Instagram"
                width={24}
                height={24}
                className="mr-2 hover:cursor-pointer"
                onClick={shareToInstagram}
              />
              <Image
                src="/icon/reddit-logo.svg"
                alt="Reddit"
                width={24}
                height={24}
                className="mr-2 hover:cursor-pointer"
                onClick={shareToReddit}
              />
              <Image
                src="/icon/tiktok-logo.svg"
                alt="TikTok"
                width={24}
                height={24}
                className="mr-2 hover:cursor-pointer"
                onClick={shareToTikTok}
              />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
