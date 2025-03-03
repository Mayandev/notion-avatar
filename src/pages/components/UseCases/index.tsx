import { useTranslation } from 'next-i18next';
import Image from 'next/legacy/image';

type UseCase = {
  title: string;
  description: string;
  preview: string;
};

export default function UseCases() {
  const { t } = useTranslation('common');

  const cases: UseCase[] = [
    {
      title: 'Notion 工作区',
      description: '为你的团队成员创建统一风格的头像',
      preview: '/previews/notion-workspace.png',
    },
    {
      title: '个人主页',
      description: '让你的个人网站更具特色',
      preview: '/previews/personal-site.png',
    },
    {
      title: '社交媒体',
      description: '在各大社交平台展示你的个性',
      preview: '/previews/social-media.png',
    },
    {
      title: '团队介绍',
      description: '打造专业的团队展示页面',
      preview: '/previews/team-page.png',
    },
  ];

  return (
    <section className="py-16 relative">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold inline-block relative">
            <span className="relative z-10">{t('useCases')}</span>
            <div className="absolute -bottom-2 left-0 w-full h-3 bg-[#ffd6cc] -z-1" />
          </h2>
          <p className="mt-6 text-lg text-gray-600">
            {t('useCasesDescription')}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {cases.map((item) => (
            <div
              key={item.title}
              className="group relative bg-white border-2 border-black rounded-xl p-6 transition-all duration-200 hover:-translate-y-1"
            >
              <div className="aspect-video relative mb-6 rounded-lg overflow-hidden border-2 border-black">
                <Image
                  src={item.preview}
                  alt={item.title}
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
