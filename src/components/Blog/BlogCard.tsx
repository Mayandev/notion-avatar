import Link from 'next/link';
import Image from 'next/legacy/image';

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  coverImage?: string;
}

interface BlogCardProps {
  post: BlogPostMeta;
}

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

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article className="bg-white border-3 border-black rounded-lg overflow-hidden transition-all duration-300 hover:translate-x-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row">
        {/* Cover Image */}
        {post.coverImage && (
          <div className="relative w-full sm:w-48 md:w-56 h-48 sm:h-auto flex-shrink-0 overflow-hidden border-b-3 sm:border-b-0 sm:border-r-3 border-black">
            <Image
              src={post.coverImage}
              alt={post.title}
              layout="fill"
              objectFit="cover"
              className="transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col justify-center">
          {/* Date */}
          <time
            dateTime={post.date}
            className="text-sm text-gray-500 font-medium"
          >
            {formatDate(post.date)}
          </time>

          {/* Title */}
          <h2 className="text-xl font-bold text-gray-900 mt-2 mb-3 line-clamp-2 group-hover:text-gray-700 transition-colors">
            {post.title}
          </h2>

          {/* Description */}
          <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
            {post.description}
          </p>

          {/* Read More Indicator */}
          <div className="mt-4 flex items-center text-sm font-bold text-black group-hover:translate-x-1 transition-transform">
            <span>Read more</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 ml-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </article>
    </Link>
  );
}
