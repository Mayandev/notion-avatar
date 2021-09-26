import type { NextPage } from 'next';
import Head from 'next/head';
import Header from './components/Header';
import Footer from './components/Footer';

import AvatarEditor from './components/AvatarEditor';

const TITLE = `Notion Avatar Maker`;
const DESCRIPTION = `An online tool for making notion-style avatars`;
const URL = `https://notion-avatar.vercel.app/`;
const Home: NextPage = () => (
  <>
    <Head>
      <link
        rel="apple-touch-icon"
        sizes="57x57"
        href="/favicon/apple-icon-57x57.png"
      />
      <link
        rel="apple-touch-icon"
        sizes="60x60"
        href="/favicon/apple-icon-60x60.png"
      />
      <link
        rel="apple-touch-icon"
        sizes="72x72"
        href="/favicon/apple-icon-72x72.png"
      />
      <link
        rel="apple-touch-icon"
        sizes="76x76"
        href="/favicon/apple-icon-76x76.png"
      />
      <link
        rel="apple-touch-icon"
        sizes="114x114"
        href="/favicon/apple-icon-114x114.png"
      />
      <link
        rel="apple-touch-icon"
        sizes="120x120"
        href="/favicon/apple-icon-120x120.png"
      />
      <link
        rel="apple-touch-icon"
        sizes="144x144"
        href="/favicon/apple-icon-144x144.png"
      />
      <link
        rel="apple-touch-icon"
        sizes="152x152"
        href="/favicon/apple-icon-152x152.png"
      />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/favicon/apple-icon-180x180.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="192x192"
        href="/favicon/android-icon-192x192.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="96x96"
        href="/favicon/favicon-96x96.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon/favicon-16x16.png"
      />
      <link rel="manifest" href="/favicon/manifest.json" />
      <title>{TITLE}</title>
      <meta name="description" content={DESCRIPTION} />
      <meta name="msapplication-TileColor" content="#fffefc" />
      <meta
        name="msapplication-TileImage"
        content="/favicon/ms-icon-144x144.png"
      />
      <meta name="theme-color" content="#fffefc" />
      <meta content={DESCRIPTION} name="description" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={TITLE} />
      <meta property="og:title" content={TITLE} />
      <meta property="og:description" content={DESCRIPTION} />
      <meta property="og:url" content={URL} />
      <meta property="og:image" content="https://i.imgur.com/KRobkqb.png" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content="https://i.imgur.com/KRobkqb.png" />
      <meta name="twitter:site" content="@phillzou" />
      <meta name="twitter:title" content={TITLE} />
      <meta name="twitter:description" content={DESCRIPTION} />
    </Head>

    <Header />

    <main className="my-5">
      <AvatarEditor />
    </main>
    <Footer />
  </>
);

export default Home;
