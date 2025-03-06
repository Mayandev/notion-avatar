import { useTranslation } from 'next-i18next';
import Image from 'next/legacy/image';

type Message = {
  sender: string;
  content: string;
  link?: {
    text: string;
    url: string;
  };
};

export default function ChatDemo() {
  const { t } = useTranslation('common');
  const messages: Message[] = [
    {
      sender: t('you'),
      content: t('chatDemo.message1'),
    },
    {
      sender: 'Sofia Davis',
      content: t('chatDemo.message2'),
    },
    {
      sender: t('you'),
      content: t('chatDemo.message3'),
      link: {
        text: t('siteTitle'),
        url: '/',
      },
    },
    {
      sender: 'Sofia Davis',
      content: t('chatDemo.message4'),
    },
  ];

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl border-3 border-black p-4 flex flex-col h-full">
      <div className="flex items-center space-x-3 mb-6 border-b border-gray-100 pb-4">
        <div className="w-10 h-10 relative">
          <Image
            src="/image/avatar-5.png"
            alt="Sofia Davis"
            layout="fill"
            className="rounded-full border-3 border-black"
          />
        </div>
        <div>
          <h3 className="font-bold">Sofia Davis</h3>
          <p className="text-sm text-gray-500">sofia@notion-avatar.app</p>
        </div>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.content}
            className={`flex items-start space-x-3 ${
              message.sender === t('you')
                ? 'flex-row-reverse space-x-reverse'
                : ''
            }`}
          >
            <div className="w-10 h-10 relative flex-shrink-0">
              <Image
                src={
                  message.sender === t('you')
                    ? '/image/avatar-6.png'
                    : '/image/avatar-5.png'
                }
                alt={message.sender}
                layout="fill"
                className="rounded-full border-3 border-black"
              />
            </div>
            <div
              className={`p-3 rounded-xl max-w-[75%] ${
                message.sender === t('you')
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p>
                {message.link ? (
                  <>
                    <a
                      href={message.link.url}
                      className="underline hover:opacity-95 transition-opacity"
                    >
                      {message.link.text}
                    </a>
                    {` ${message.content}`}
                  </>
                ) : (
                  message.content
                )}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center space-x-2 pt-4 mt-auto border-t border-gray-100">
        <input
          type="text"
          placeholder={t('chatDemo.inputPlaceholder')}
          className="flex-1 p-3 rounded-lg border-3 border-black focus:outline-none h-12"
        />
        <button
          type="button"
          className="rounded-lg border-3 border-black h-12 w-12 flex items-center justify-center"
          aria-label={t('chatDemo.send')}
        >
          <Image
            src="/icon/send.svg"
            width={24}
            height={24}
            alt={t('chatDemo.send')}
          />
        </button>
      </div>
    </div>
  );
}
