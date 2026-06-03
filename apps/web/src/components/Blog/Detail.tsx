import type { Post } from "@repo/db/data";
import { marked } from "marked";
import Link from "next/link";
import { AddToCartButton } from "../Cart/AddToCartButton";

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
  }).format(post.priceAud ?? Math.max(post.views, 1));
}

function getStockQuantity(post: Post) {
  return post.stockQuantity ?? post.likes;
}

function getProductPrice(post: Post) {
  return post.priceAud ?? Math.max(post.views, 1);
}

export async function BlogDetail({ post }: { post: Post }) {
  const content = await marked.parse(post.content);

  return (
    <article
      data-test-id={`blog-post-${post.id}`}
      className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-900"
    >
      <div className="grid lg:grid-cols-[minmax(18rem,24rem)_1fr]">
        <div className="flex items-center justify-center bg-gray-100 p-6 dark:bg-gray-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.imageUrl}
            alt={post.title}
            className="max-h-[32rem] w-full object-contain drop-shadow-xl"
          />
        </div>

        <div className="space-y-5 p-6 lg:p-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
              {post.category}
            </p>
            <h1 className="mt-2 text-3xl font-bold leading-tight text-[var(--text)]">
              <Link
                href={`/post/${post.urlId}`}
                className="transition hover:text-blue-600"
              >
                {post.title}
              </Link>
            </h1>
            <p className="mt-2 text-sm font-medium text-[var(--text-secondary)]">
              Listed {formatDate(post.date)}
            </p>
          </div>

          <p className="text-3xl font-semibold text-[var(--text)]">
            {formatPrice(post)}
          </p>

          <p className="w-fit rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700 dark:bg-green-950 dark:text-green-300">
            {getStockQuantity(post)} copies available
          </p>

          <div className="flex flex-wrap gap-2">
            {post.tags.split(",").map((tag) => (
              <span
                key={tag.trim()}
                className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300"
              >
                #{tag.trim()}
              </span>
            ))}
          </div>

          <AddToCartButton
            product={{
              id: post.id,
              urlId: post.urlId,
              title: post.title,
              price: getProductPrice(post),
              imageUrl: post.imageUrl,
            }}
          />

          <div
            data-test-id="content-markdown"
            className="prose prose-sm max-w-none leading-7 text-[var(--text)] dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>
    </article>
  );
}
