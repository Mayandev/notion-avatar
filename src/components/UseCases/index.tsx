import { useTranslation } from 'next-i18next';
import Image from 'next/legacy/image';
import ChatDemo from './ChatDemo';
import SocialDemo from './SocialDemo';

export default function UseCases() {
  const { t } = useTranslation('common');

  return (
    <section className="py-16 relative">
      <div className="max-w-4xl mx-auto px-4">
        {' '}
        {/* 将 max-w-6xl 改为 max-w-4xl */}
        <div className="text-center mb-16">
          <h2 className="text-2xl font-bold inline-block relative">
            <span className="relative">{t('useCases')}</span>
            <span className="absolute top-[-32px] right-[-32px]">
              <Image
                src="/icon/star.svg"
                width={32}
                height={34}
                alt="star"
                aria-hidden="true"
              />
            </span>
          </h2>
          <p className="mt-6 text-gray-500">{t('useCasesDescription')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {' '}
          {/* 将 gap-4 改为 gap-6 */}
          <ChatDemo />
          <SocialDemo />
        </div>
      </div>
    </section>
  );
}
