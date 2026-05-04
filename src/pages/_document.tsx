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
          <script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3671095188342075"
            crossOrigin="anonymous"
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
