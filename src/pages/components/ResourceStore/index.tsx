import { useTranslation } from 'next-i18next';
import Image from 'next/legacy/image';

export default function ResourceStore() {
  const { t } = useTranslation('common');

  return (
    <section className="py-16">
      <div className="max-w-4xl mx-auto px-4">
        {' '}
        {/* 将 max-w-6xl 改为 max-w-4xl */}
        <div className="text-center mb-16">
          <h2 className="text-2xl font-bold mb-4 relative  inline-block">
            {t('resourceStore.title')}
            <span className="absolute top-[-32px] left-[-32px]">
              <Image src="/icon/bling.svg" width={32} height={34} />
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
            <p className="text-gray-600 mb-6">
              {t('resourceStore.designPack.description')}
            </p>
            <div className="flex items-baseline mb-6">
              <span className="text-3xl font-bold">$1.99</span>
              <span className="ml-2 text-lg line-through text-gray-400">
                $9.9
              </span>
            </div>
            <div className="space-y-3 mb-8">
              <div className="flex items-center text-sm">
                <Image
                  src="/icon/check.svg"
                  width={16}
                  height={16}
                  alt="check"
                />
                <span className="ml-2">Figma</span>
              </div>
              <div className="flex items-center text-sm">
                <Image
                  src="/icon/check.svg"
                  width={16}
                  height={16}
                  alt="check"
                />
                <span className="ml-2">
                  {t('resourceStore.designPack.features.1')}
                </span>
              </div>
            </div>
            <a
              href="https://mayandev.gumroad.com/l/notion-avatar-maker"
              className="block w-full text-center py-3 px-6 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('resourceStore.buyNow')}
            </a>
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
              <span className="ml-2 text-lg line-through text-gray-400">
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
            </div>
            <a
              href="https://mayandev.gumroad.com/l/notion-scribbles"
              className="block w-full text-center py-3 px-6 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('resourceStore.buyNow')}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
