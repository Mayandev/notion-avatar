import { useState, useRef, useEffect } from 'react';
import Image from 'next/legacy/image';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

interface LanguageSwitcherProps {
  iconSize?: number;
  className?: string;
}

const languages = [
  { code: 'en', name: 'English' },
  { code: 'zh', name: '中文' },
  { code: 'zh-TW', name: '繁體中文' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'ru', name: 'Русский' },
  { code: 'pt', name: 'Português' },
];

export default function LanguageSwitcher({
  iconSize = 20,
  className = '',
}: LanguageSwitcherProps) {
  const { t, i18n } = useTranslation('common');
  const router = useRouter();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const languageMenuRef = useRef<HTMLDivElement>(null);

  // Close language menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        languageMenuRef.current &&
        !languageMenuRef.current.contains(event.target as Node)
      ) {
        setShowLanguageMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={languageMenuRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setShowLanguageMenu(!showLanguageMenu)}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center"
        aria-label={t('language')}
      >
        <Image
          src="/icon/language.svg"
          alt="Language"
          width={iconSize}
          height={iconSize}
        />
      </button>
      {showLanguageMenu && (
        <div className="absolute right-0 mt-2 bg-white shadow-xl rounded-xl border border-gray-100 py-2 z-50 min-w-[140px]">
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                i18n.language === lang.code ? 'bg-gray-50 font-medium' : ''
              }`}
              onClick={() => {
                i18n.changeLanguage(lang.code);
                router.push(router.asPath, router.asPath, {
                  locale: lang.code,
                });
                setShowLanguageMenu(false);
              }}
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
