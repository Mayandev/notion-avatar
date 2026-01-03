import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/legacy/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  coverImage?: string;
  content: string;
}

interface BlogLayoutProps {
  post: BlogPost;
}

const BASE_URL = 'https://notion-avatar.app';

/**
 * Format a date string for display
 */
function formatDate(dateString: string): string {
  if (!dateString) return '';

  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function BlogLayout({ post }: BlogLayoutProps) {
  const canonicalUrl = `${BASE_URL}/blog/${post.slug}`;
  const coverImageUrl = post.coverImage
    ? `${BASE_URL}${post.coverImage}`
    : `${BASE_URL}/social.png`;

  return (
    <>
      <Head>
        {/* Basic Meta Tags */}
        <title>{post.title} | Notion Avatar Blog</title>
        <meta name="description" content={post.description} />
        <meta name="author" content="Notion Avatar" />

        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={coverImageUrl} />
        <meta property="og:site_name" content="Notion Avatar Blog" />
        <meta property="article:published_time" content={post.date} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.description} />
        <meta name="twitter:image" content={coverImageUrl} />
        <meta name="twitter:site" content="@phillzou" />

        {/* Canonical URL */}
        <link rel="canonical" href={canonicalUrl} />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BlogPosting',
              headline: post.title,
              description: post.description,
              image: coverImageUrl,
              datePublished: post.date,
              author: {
                '@type': 'Organization',
                name: 'Notion Avatar',
                url: BASE_URL,
              },
              publisher: {
                '@type': 'Organization',
                name: 'Notion Avatar',
                url: BASE_URL,
                logo: {
                  '@type': 'ImageObject',
                  url: `${BASE_URL}/logo.gif`,
                },
              },
              mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': canonicalUrl,
              },
            }),
          }}
        />
      </Head>

      <Header />

      <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <article className="max-w-3xl mx-auto">
          {/* Back to Blog */}
          <Link
            href="/blog"
            className="inline-flex items-center text-sm font-bold text-black hover:text-gray-600 transition-colors mb-8 group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Blog
          </Link>

          {/* Article Header */}
          <header className="mb-8">
            <time
              dateTime={post.date}
              className="text-sm text-gray-500 font-medium"
            >
              {formatDate(post.date)}
            </time>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-4 leading-tight">
              {post.title}
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              {post.description}
            </p>
          </header>

          {/* Cover Image */}
          {post.coverImage && (
            <div className="relative w-full h-64 sm:h-80 md:h-96 mb-8 rounded-lg overflow-hidden border-3 border-black">
              <Image
                src={post.coverImage}
                alt={post.title}
                layout="fill"
                objectFit="cover"
                priority
              />
            </div>
          )}

          {/* Article Content */}
          <div
            className="prose prose-lg max-w-none
              prose-headings:font-bold prose-headings:text-gray-900
              prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
              prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
              prose-a:text-black prose-a:font-semibold prose-a:underline prose-a:underline-offset-2 hover:prose-a:text-gray-600
              prose-strong:text-gray-900 prose-strong:font-bold
              prose-ul:my-4 prose-ul:pl-6 prose-li:text-gray-700 prose-li:mb-2
              prose-ol:my-4 prose-ol:pl-6
              prose-blockquote:border-l-4 prose-blockquote:border-black prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600
              prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
              prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-lg prose-pre:border-3 prose-pre:border-black prose-pre:overflow-x-auto
              prose-img:rounded-lg prose-img:border-3 prose-img:border-black
              prose-table:border-3 prose-table:border-black prose-table:rounded-lg prose-table:overflow-hidden
              prose-th:px-4 prose-th:py-3 prose-th:text-left prose-th:font-bold prose-th:text-gray-900
              prose-td:px-4 prose-td:py-3 prose-td:border-t prose-td:border-gray-200"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Footer Navigation */}
          <div className="mt-12 pt-8 border-t-3 border-black">
            <Link
              href="/blog"
              className="inline-flex items-center px-6 py-3 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              View All Posts
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </>
  );
}
