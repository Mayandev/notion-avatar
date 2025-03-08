import { useTranslation } from 'next-i18next';
import Image from 'next/legacy/image';
import { useState } from 'react';

export default function SocialDemo() {
  const { t } = useTranslation('common');
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(23);
  const [repostCount, setRepostCount] = useState(5);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: t('siteTitle'),
        text: t('shareContent'),
        url: window.location.origin,
      });
      setRepostCount((prev) => prev + 1);
    } catch (err) {
      // 如果浏览器不支持分享API或用户取消分享，静默失败
      throw new Error('Share failed');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-xl border-3 border-black p-6">
        {/* 个人主页部分 */}
        <div className="flex flex-col items-center text-center border-b border-gray-100 pb-6 mb-6">
          <div className="w-20 h-20 relative mb-4">
            <Image
              src="/image/avatar-6.png"
              alt="Profile"
              layout="fill"
              className="rounded-full border-3 border-black"
            />
          </div>
          <h2 className="text-xl font-bold mb-2">{t('socialDemo.name')}</h2>
          <p className="text-gray-600 mb-4">{t('socialDemo.bio')}</p>

          <div className="flex space-x-4">
            <a
              href="https://github.com/Mayandev"
              className="text-gray-600 hover:text-black"
            >
              <Image
                src="/icon/github.svg"
                width={24}
                height={24}
                alt="GitHub"
              />
            </a>
            <a
              href="https://x.com/phillzou"
              className="text-gray-600 hover:text-black"
            >
              <Image src="/icon/x-logo.svg" width={24} height={24} alt="X" />
            </a>
          </div>
        </div>

        {/* 推文部分 */}
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 relative flex-shrink-0">
            <Image
              src="/image/avatar-6.png"
              alt="Profile"
              layout="fill"
              className="rounded-full border-2 border-black"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-bold">{t('socialDemo.name')}</h3>
              <span className="text-gray-500">@{t('socialDemo.handle')}</span>
            </div>
            <p className="mt-2 text-gray-900">{t('socialDemo.tweet')}</p>
            <div className="mt-2 w-full h-48 md:36 relative border-2 border-gray-100 rounded-lg">
              <Image
                src="/social.png"
                alt="Notion Avatar Maker"
                layout="fill"
                objectFit="contain"
                className="rounded-xl"
              />
            </div>
            <div className="mt-4 flex items-center space-x-12 text-gray-500">
              <button
                type="button"
                className={`flex items-center space-x-2 transition-colors ${
                  liked ? 'text-red-500 hover:text-red-600' : ''
                }`}
                onClick={handleLike}
              >
                <Image
                  src={liked ? '/icon/heart.svg' : '/icon/heart-outline.svg'}
                  width={20}
                  height={20}
                  alt="Like"
                />
                <span>{likeCount}</span>
              </button>
              <button
                type="button"
                className="flex items-center space-x-2 transition-colors"
                onClick={handleShare}
              >
                <Image
                  src="/icon/repost.svg"
                  width={20}
                  height={20}
                  alt="Share"
                />
                <span>{repostCount}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
