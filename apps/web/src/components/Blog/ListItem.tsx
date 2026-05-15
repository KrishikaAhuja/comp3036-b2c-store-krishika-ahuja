import type { Post } from "@repo/db/data";
import Link from "next/link";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function formatPrice(post: Post) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(Math.max(post.views, 1));
}

export function BlogListItem({ post }: { post: Post }) {
  return (
    <article
      className="flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-[var(--background)] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700"
      data-test-id={`blog-post-${post.id}`}
    >
      <Link href={`/post/${post.urlId}`} className="block bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.imageUrl}
          alt={post.title}
          className="aspect-[4/3] w-full object-cover"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
            {post.category}
          </p>
          <p className="text-xs font-medium text-[var(--text-secondary)]">
            Listed <span>{formatDate(post.date)}</span>
          </p>
        </div>

        <Link
          href={`/post/${post.urlId}`}
          className="text-lg font-semibold leading-snug text-[var(--foreground)] transition hover:text-blue-600"
        >
          {post.title}
        </Link>

        <p className="text-2xl font-semibold text-[var(--foreground)]">
          {formatPrice(post)}
        </p>

        <p className="line-clamp-3 text-sm leading-6 text-[var(--text-secondary)]">
          {post.description}
        </p>

        <div className="flex flex-wrap gap-2">
          {post.tags.split(",").map((tag) => (
            <span
              key={tag.trim()}
              className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              #{tag.trim()}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between gap-4 border-t border-gray-200 pt-4 text-sm text-[var(--text-secondary)] dark:border-gray-700">
          <p>{post.views} customer views</p>
          <p>{post.likes} saved</p>
        </div>

        <Link
          href={`/post/${post.urlId}`}
          className="mt-1 inline-flex h-10 items-center justify-center rounded-md bg-[var(--foreground)] px-4 text-sm font-semibold text-[var(--background)] transition hover:opacity-90"
        >
          View Product
        </Link>
      </div>
    </article>
  );
}
