import type { Post } from "@repo/db/data";
import Link from "next/link";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function BlogListItem({ post }: { post: Post }) {
  return (
    <article
      className="flex flex-col gap-0 overflow-hidden rounded-2xl border border-gray-200 bg-[var(--background)] shadow-sm hover:shadow-md md:flex-row dark:border-gray-700"
      data-test-id={`blog-post-${post.id}`}
    >
      <img
        src={post.imageUrl}
        alt={post.title}
        className="h-56 w-full object-cover md:h-auto md:w-56"
      />

      <div className="flex flex-1 flex-col gap-3 p-6">
        <p className="text-sm font-medium text-[var(--text-secondary)]">
          {formatDate(post.date)}
        </p>

        <Link
          href={`/post/${post.urlId}`}
          className="text-2xl font-semibold leading-tight text-blue-600 transition hover:text-blue-700"
        >
          {post.title}
        </Link>

        <p className="text-sm font-medium uppercase tracking-wide text-[var(--text-secondary)]">
          {post.category}
        </p>

        <p className="text-base leading-7 text-[var(--text-secondary)]">
          {post.description}
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          {post.tags.split(",").map((tag) => (
            <span
              key={tag.trim()}
              className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              #{tag.trim()}
            </span>
          ))}
        </div>

        <div className="mt-2 flex items-center gap-6 text-sm text-[var(--text-secondary)]">
          <p>{post.views} views</p>
          <p>{post.likes} likes</p>
        </div>
      </div>
    </article>
  );
}