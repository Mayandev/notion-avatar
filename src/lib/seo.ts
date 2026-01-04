/**
 * SEO 工具函数 - 用于生成多语言的 canonical URL 和 hreflang 标签
 */

const BASE_URL = 'https://notion-avatar.app';
const SUPPORTED_LOCALES = [
  'en',
  'zh',
  'zh-TW',
  'ja',
  'ko',
  'es',
  'fr',
  'de',
  'ru',
  'pt',
];

/**
 * 生成指定路径的 canonical URL
 * @param path - 页面路径（如 '/account', '/pricing'）
 * @param locale - 当前语言环境
 * @returns 完整的 canonical URL
 */
export function getCanonicalUrl(path: string, locale?: string): string {
  const currentLocale = locale || 'en';
  if (currentLocale === 'en') {
    return `${BASE_URL}${path}`;
  }
  return `${BASE_URL}/${currentLocale}${path}`;
}

/**
 * 生成指定路径的 hreflang URL
 * @param path - 页面路径
 * @param locale - 语言代码
 * @returns 完整的 hreflang URL
 */
export function getHreflangUrl(path: string, locale: string): string {
  if (locale === 'en') {
    return `${BASE_URL}${path}`;
  }
  return `${BASE_URL}/${locale}${path}`;
}

/**
 * 生成所有语言的 hreflang 链接配置
 * @param path - 页面路径
 * @returns hreflang 配置数组
 */
export function getHreflangLinks(path: string) {
  return SUPPORTED_LOCALES.map((locale) => ({
    hrefLang: locale,
    href: getHreflangUrl(path, locale),
  }));
}

/**
 * 获取默认语言（x-default）的 URL
 * @param path - 页面路径
 * @returns 默认语言 URL（通常是英文版本）
 */
export function getDefaultHreflangUrl(path: string): string {
  return `${BASE_URL}${path}`;
}
