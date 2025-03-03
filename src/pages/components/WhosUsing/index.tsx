import { useTranslation } from 'next-i18next';
import Image from 'next/legacy/image';

type Testimonial = {
  name: string;
  avatar: string;
  handle: string;
  content: string;
  date: string;
  url: string;
};

export default function WhosUsing() {
  const { t } = useTranslation('common');

  const testimonials: Testimonial[] = [
    {
      name: 'Shadcn',
      avatar: '/image/avatar-1.jpg',
      handle: '@shadcn',
      content:
        'I used Notion Avatar Maker to generate matching avatars for our Shadcn UI library. This is really helpful for the shadcn ui to have a consistent look and feel.',
      date: '2024-01-29',
      url: 'https://x.com/shadcn',
    },
    {
      name: 'つぶあん',
      avatar: '/image/avatar-2.jpg',
      handle: '@tsubuan_sun',
      content:
        'Notion風アイコンが作れる「Notion Avatar Maker」がめちゃおもろい！スマホ＆PCから無料で作れて、かなり自由に使えるよ（ライセンスは各自確認しようね）アイコン変えたい人は検索してみて...',
      date: '2024-04-14',
      url: 'https://x.com/tsubuan_sun/status/1779273857150718068',
    },
    {
      name: 'ruanyf',
      avatar: '/image/avatar-3.jpg',
      handle: '@ruanyf',
      content:
        'Notion Avatar Maker 是一个网页工具，用来生成 Notion 风格的头像。各种细节都可以定制，挺好玩的。',
      date: '2021-10-15',
      url: 'https://x.com/ruanyf/status/1448819296990236718',
    },
    {
      name: 'Mayandev',
      avatar: '/image/avatar-4.jpg',
      handle: '@phillzou',
      content:
        'Finally found the perfect tool for my Notion workspace! This avatar maker is exactly what I needed. 💫',
      date: '2023-12-15',
      url: 'https://twitter.com/phillzou',
    },
  ];

  return (
    <section className="py-16 relative mt-8">
      <div className="absolute left-[-40px] top-0">
        <Image src="/icon/chat.svg" width="145" height="140" alt="Icon Chat" />
      </div>
      <div className="max-w-4xl mx-auto px-4 mt-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl font-bold inline-block relative">
            <span className="relative z-10">{t('whosUsing')}</span>
          </h2>
          <p className="mt-6 text-gray-500">{t('whosUsingDescription')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((item, _) => (
            <a
              key={item.handle}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <div
                className={`
                p-8 bg-white border-[3px] border-black rounded-xl
                transition-all duration-200 ease-in-out shadow-sm
                relative
              `}
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 relative flex-shrink-0">
                    <Image
                      src={item.avatar}
                      alt={item.name}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-full border-2 border-black"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="text-base font-bold text-black mb-1">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-700">{item.handle}</p>
                      </div>
                      <Image
                        src="/icon/x-logo.svg"
                        width={20}
                        height={20}
                        alt="X"
                        className="flex-shrink-0"
                      />
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-black">
                      {item.content}
                    </p>
                    <p className="mt-2 text-xs text-gray-700">
                      {new Date(item.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
