import NextDocument, { Html, Head, Main, NextScript } from 'next/document';
import React from 'react';

class Document extends NextDocument {
  render() {
    return (
      <Html>
        <Head>
          {/* 预加载关键资源 */}
          <link
            rel="preload"
            href="/fonts/Quicksand.ttf"
            as="font"
            type="font/ttf"
            crossOrigin="anonymous"
          />
          {/* Google Analytics - 延迟加载 */}
          <script
            async
            defer
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}', {
              page_path: window.location.pathname,
            });
          `,
            }}
          />
        </Head>
        <body className="font-bold">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default Document;
