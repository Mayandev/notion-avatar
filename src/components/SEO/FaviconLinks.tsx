/**
 * 可复用的 Favicon 链接组件
 * 用于在所有页面中统一添加 favicon 配置
 */
export default function FaviconLinks() {
  return (
    <>
      {/* Favicon - 关键尺寸 */}
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon/favicon-16x16.png"
      />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/favicon/apple-icon-180x180.png"
      />
      <link rel="manifest" href="/manifest.json" />
      <meta name="theme-color" content="#fffefc" />
      <meta name="msapplication-TileColor" content="#fffefc" />
      <meta
        name="msapplication-TileImage"
        content="/favicon/ms-icon-144x144.png"
      />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Notion Avatar" />
    </>
  );
}
