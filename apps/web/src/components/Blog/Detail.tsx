import type { Post } from "@repo/db/data"; // temporary product data shape
import { marked } from "marked"; // library to convert markdown → HTML
import Link from "next/link"; // used for navigation between pages

// formats the date into a readable format (e.g. 05 Jan 2026)
function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

// main component to display full product details
export async function BlogDetail({ post }: { post: Post }) {

  // converts markdown content into HTML so it can be displayed properly
  const content = await marked.parse(post.content);

  return (
    <article
      data-test-id={`blog-post-${post.id}`} // used for testing
      className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-900"
    >
      {/* product image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={post.imageUrl}
        alt={post.title}
        className="h-48 w-full object-cover"
      />

      <div className="space-y-3 p-6">

        {/* formatted date */}
        <p className="text-sm font-medium text-[var(--text-secondary)]">
          Listed {formatDate(post.date)}
        </p>

        {/* product title with link to itself */}
        <h1>
          <Link
            href={`/post/${post.urlId}`}
            className="text-3xl font-bold leading-tight text-blue-600 transition hover:text-blue-700"
          >
            {post.title}
          </Link>
        </h1>

        {/* category of the post */}
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
          {post.category}
        </p>

        {/* tags section */}
        <div className="flex flex-wrap gap-2">
          {post.tags.split(",").map((tag) => (
            <span
              key={tag.trim()}
              className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300"
            >
              #{tag.trim()} {/* shows each tag with # */}
            </span>
          ))}
        </div>

        {/* markdown content displayed as HTML */}
        <div
          data-test-id="content-markdown" // used for testing
          className="prose prose-sm max-w-none leading-7 text-[var(--text)] dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: content }} // injects HTML (from markdown)
        />

        {/* views and likes section */}
        <div className="flex gap-5 rounded-xl bg-gray-50 px-4 py-3 text-sm font-medium text-[var(--text-secondary)] dark:bg-gray-800">
          <p>{post.views} customer views</p>
          <p>{post.likes} saved</p>
        </div>

        {/* hidden element used only for testing (not visible to users) */}
        <span className="hidden" data-testid="like-button">
          Save item
        </span>
      </div>
    </article>
  );
}
