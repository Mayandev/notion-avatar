import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import BlogLayout, { BlogPost } from '@/components/Blog/BlogLayout';
import { getAllPostSlugs, getPostBySlug } from '@/lib/blog';

interface BlogPostPageProps {
  post: BlogPost;
}

const BlogPostPage: NextPage<BlogPostPageProps> = ({ post }) => (
  <BlogLayout post={post} />
);

export const getStaticPaths: GetStaticPaths = async ({ locales }) => {
  const slugs = getAllPostSlugs();

  const paths: { params: { slug: string }; locale: string }[] = [];

  // Generate paths for each slug and each locale
  slugs.forEach((slug) => {
    (locales || ['en']).forEach((locale) => {
      paths.push({
        params: { slug },
        locale,
      });
    });
  });

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<BlogPostPageProps> = async ({
  params,
  locale,
}) => {
  const slug = params?.slug as string;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      post,
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  };
};

export default BlogPostPage;
