import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import Image from 'next/legacy/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/Auth/AuthModal';
import toast from 'react-hot-toast';

interface ResourceStoreProps {
  purchasedPacks?: string[];
  onDownload?: (packId: string) => void;
  showDownloadButton?: boolean;
}

export default function ResourceStore({
  purchasedPacks = [],
  onDownload,
  showDownloadButton = false,
}: ResourceStoreProps) {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [loadingPack, setLoadingPack] = useState<string | null>(null);
  const [downloadingPack, setDownloadingPack] = useState<string | null>(null);

  const handlePurchase = async (
    resourcePackId: 'design-pack' | 'scribbles-pack',
  ) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    setLoadingPack(resourcePackId);

    try {
      const response = await fetch('/api/stripe/resource-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resourcePackId }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Purchase error:', error);
      toast.error('Failed to start checkout. Please try again.');
      setLoadingPack(null);
    }
  };

  const handleDownload = async (packId: 'design-pack' | 'scribbles-pack') => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    setDownloadingPack(packId);

    try {
      if (onDownload) {
        // Use provided download handler
        await onDownload(packId);
        // If download succeeds but doesn't redirect, clear loading state
        // (onDownload might throw error or redirect, so this handles non-redirect case)
        setDownloadingPack(null);
      } else {
        // Default download handler
        const response = await fetch(`/api/resources/download?pack=${packId}`);
        const data = await response.json();

        if (response.ok && data.url) {
          // Will redirect, so don't clear loading state here
          window.location.href = data.url;
        } else {
          throw new Error(data.error || 'Failed to download');
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Download error:', error);
      toast.error('Failed to download resource pack. Please try again.');
      setDownloadingPack(null);
    }
  };

  const isPurchased = (packId: string) => purchasedPacks.includes(packId);

  return (
    <section className="py-16">
      <div className="max-w-4xl mx-auto px-4">
        {' '}
        {/* 将 max-w-6xl 改为 max-w-4xl */}
        <div className="text-center mb-16">
          <h2 className="text-2xl font-bold mb-4 relative  inline-block">
            {t('resourceStore.title')}
            <span className="absolute top-[-32px] left-[-32px]">
              <Image
                src="/icon/bling.svg"
                width={32}
                height={34}
                alt="bling"
                aria-hidden="true"
              />
            </span>
          </h2>
          <p className="text-gray-600">{t('resourceStore.description')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-xl border-3 border-black">
            <div className="aspect-video relative mb-6 border-2 border-gray-200 rounded-sm">
              <Image
                src="/social.png"
                alt="Figma Design Resources"
                layout="fill"
                objectFit="cover"
                className="rounded-lg"
              />
            </div>
            <h3 className="text-xl font-bold mb-4">
              {t('resourceStore.designPack.title')}
            </h3>
            <p className="text-gray-600 mb-6 h-12">
              {t('resourceStore.designPack.description')}
            </p>
            <div className="flex items-baseline mb-6">
              <span className="text-3xl font-bold">$1.99</span>
              <span
                className="ml-2 text-lg line-through text-gray-500"
                aria-label="original price $9.99"
              >
                $9.9
              </span>
            </div>
            <div className="space-y-3 mb-8">
              <div className="flex items-center text-sm">
                <Image
                  src="/icon/check.svg"
                  width={20}
                  height={20}
                  alt="check"
                />
                <span className="ml-2">Figma</span>
              </div>
              <div className="flex items-center text-sm">
                <Image
                  src="/icon/check.svg"
                  width={20}
                  height={20}
                  alt="check"
                />
                <span className="ml-2">
                  {t('resourceStore.designPack.features.1')}
                </span>
              </div>
              <Link href="/pricing" className="flex items-center text-sm group">
                <Image
                  src="/icon/check.svg"
                  width={20}
                  height={20}
                  alt="check"
                />
                <span className="ml-2 font-medium group-hover:underline">
                  {t('resourceStore.freeForPro')}
                </span>
              </Link>
            </div>
            {showDownloadButton && isPurchased('design-pack') ? (
              <button
                onClick={() => handleDownload('design-pack')}
                disabled={downloadingPack === 'design-pack'}
                type="button"
                className="w-full text-center py-3 px-6 bg-black text-white rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloadingPack === 'design-pack'
                  ? 'Downloading...'
                  : 'Download'}
              </button>
            ) : user ? (
              <button
                onClick={() => handlePurchase('design-pack')}
                disabled={loadingPack === 'design-pack'}
                type="button"
                className="w-full text-center py-3 px-6 bg-black text-white rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingPack === 'design-pack'
                  ? 'Processing...'
                  : t('resourceStore.buyNow')}
              </button>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                type="button"
                className="w-full text-center py-3 px-6 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
              >
                Sign In to Purchase
              </button>
            )}
          </div>

          {/* Scribbles 资源包 */}
          <div className="bg-white p-8 rounded-xl border-3 border-black">
            <div className="aspect-video relative mb-6">
              <Image
                src="/image/scribble.png"
                alt="Scribbles Resources"
                layout="fill"
                objectFit="cover"
                className="rounded-lg"
              />
            </div>
            <h3 className="text-xl font-bold mb-4">
              {t('resourceStore.scribblesPack.title')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('resourceStore.scribblesPack.description')}
            </p>
            <div className="flex items-baseline mb-6">
              <span className="text-3xl font-bold">$2.99</span>
              <span
                className="ml-2 text-lg line-through text-gray-500"
                aria-label="original price $9.99"
              >
                $9.99
              </span>
            </div>
            <div className="space-y-3 mb-8">
              <div className="flex items-center text-sm">
                <Image
                  src="/icon/check.svg"
                  width={20}
                  height={20}
                  alt="check"
                />
                <span className="ml-2">SVG + Figma</span>
              </div>
              <div className="flex items-center text-sm">
                <Image
                  src="/icon/check.svg"
                  width={20}
                  height={20}
                  alt="check"
                />
                <span className="ml-2">
                  {t('resourceStore.scribblesPack.features.1')}
                </span>
              </div>
              <Link href="/pricing" className="flex items-center text-sm group">
                <Image
                  src="/icon/check.svg"
                  width={20}
                  height={20}
                  alt="check"
                />
                <span className="ml-2 font-medium group-hover:underline">
                  {t('resourceStore.freeForPro')}
                </span>
              </Link>
            </div>
            {showDownloadButton && isPurchased('scribbles-pack') ? (
              <button
                onClick={() => handleDownload('scribbles-pack')}
                disabled={downloadingPack === 'scribbles-pack'}
                type="button"
                className="w-full text-center py-3 px-6 bg-black text-white rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloadingPack === 'scribbles-pack'
                  ? 'Downloading...'
                  : 'Download'}
              </button>
            ) : user ? (
              <button
                onClick={() => handlePurchase('scribbles-pack')}
                disabled={loadingPack === 'scribbles-pack'}
                type="button"
                className="w-full text-center py-3 px-6 bg-black text-white rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingPack === 'scribbles-pack'
                  ? 'Processing...'
                  : t('resourceStore.buyNow')}
              </button>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                type="button"
                className="w-full text-center py-3 px-6 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
              >
                Sign In to Purchase
              </button>
            )}
          </div>
        </div>
      </div>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </section>
  );
}
