import type { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BlogCard, { BlogPostMeta } from '@/components/Blog/BlogCard';
import FaviconLinks from '@/components/SEO/FaviconLinks';
import { getAllPosts } from '@/lib/blog';

const BASE_URL = 'https://notion-avatar.app';

interface BlogListProps {
  posts: BlogPostMeta[];
}

const BlogList: NextPage<BlogListProps> = ({ posts }) => (
  <>
    <Head>
      <FaviconLinks />
      {/* Basic Meta Tags */}
      <title>Blog | Notion Avatar Maker</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="format-detection" content="telephone=no" />
      <meta
        name="description"
        content="Explore tips, tutorials, and updates about Notion Avatar Maker. Learn how to create unique hand-drawn style avatars for your Notion workspace and social profiles."
      />
      <meta
        name="keywords"
        content="Notion Avatar Blog, Avatar Design Tips, Hand-drawn Avatar, Notion Style Guide, Avatar Tutorials"
      />
      <meta name="author" content="Notion Avatar" />
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content="Blog | Notion Avatar Maker" />
      <meta
        property="og:description"
        content="Explore tips, tutorials, and updates about Notion Avatar Maker. Learn how to create unique hand-drawn style avatars."
      />
      <meta property="og:url" content={`${BASE_URL}/blog`} />
      <meta property="og:image" content={`${BASE_URL}/social.png`} />
      <meta property="og:site_name" content="Notion Avatar" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Blog | Notion Avatar Maker" />
      <meta
        name="twitter:description"
        content="Explore tips, tutorials, and updates about Notion Avatar Maker."
      />
      <meta name="twitter:image" content={`${BASE_URL}/social.png`} />
      <meta name="twitter:site" content="@phillzou" />

      {/* Canonical URL */}
      <link rel="canonical" href={`${BASE_URL}/blog`} />

      {/* Hreflang links */}
      <link rel="alternate" hrefLang="en" href={`${BASE_URL}/blog`} />
      <link rel="alternate" hrefLang="zh" href={`${BASE_URL}/zh/blog`} />
      <link rel="alternate" hrefLang="zh-TW" href={`${BASE_URL}/zh-TW/blog`} />
      <link rel="alternate" hrefLang="ja" href={`${BASE_URL}/ja/blog`} />
      <link rel="alternate" hrefLang="ko" href={`${BASE_URL}/ko/blog`} />
      <link rel="alternate" hrefLang="es" href={`${BASE_URL}/es/blog`} />
      <link rel="alternate" hrefLang="fr" href={`${BASE_URL}/fr/blog`} />
      <link rel="alternate" hrefLang="de" href={`${BASE_URL}/de/blog`} />
      <link rel="alternate" hrefLang="pt" href={`${BASE_URL}/pt/blog`} />
      <link rel="alternate" hrefLang="ru" href={`${BASE_URL}/ru/blog`} />
      <link rel="alternate" hrefLang="x-default" href={`${BASE_URL}/blog`} />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Blog',
            name: 'Notion Avatar Blog',
            description:
              'Tips, tutorials, and updates about Notion Avatar Maker',
            url: `${BASE_URL}/blog`,
            publisher: {
              '@type': 'Organization',
              name: 'Notion Avatar',
              url: BASE_URL,
              logo: {
                '@type': 'ImageObject',
                url: `${BASE_URL}/logo.gif`,
              },
            },
          }),
        }}
      />
    </Head>

    <Header />

    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Blog
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tips, tutorials, and updates about creating Notion-style avatars
          </p>
        </header>

        {/* Blog Posts List */}
        {posts.length > 0 ? (
          <div className="max-w-3xl mx-auto space-y-6">
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              No posts yet
            </h2>
            <p className="text-gray-600">
              Check back soon for new articles and updates!
            </p>
          </div>
        )}
      </div>
    </main>

    <Footer />
  </>
);

export const getStaticProps: GetStaticProps<BlogListProps> = async ({
  locale,
}) => {
  const posts = getAllPosts();

  return {
    props: {
      posts,
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  };
};

export default BlogList;
