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

export async function BlogDetail({
  post,
  readOnly = false,
}: {
  post: Post;
  readOnly?: boolean;
}) {
  const content = await marked.parse(post.content);
  const stockQuantity = getStockQuantity(post);
  const outOfStock = stockQuantity <= 0;
  const backHref = readOnly ? "/?preview=admin" : "/";

  return (
    <article
      data-test-id={`blog-post-${post.id}`}
      className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-[var(--surface-muted)] bg-[var(--surface)] shadow-md dark:border-gray-700"
    >
      <div className="grid lg:grid-cols-[minmax(16rem,22rem)_1fr]">
        <div className="flex items-center justify-center bg-[#f1f1ed] p-6 dark:bg-gray-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.imageUrl}
            alt={post.title}
            className="max-h-[26rem] w-full object-contain drop-shadow-xl"
          />
        </div>

        <div className="space-y-4 p-6 lg:p-7">
          <Link
            href={backHref}
            className="inline-flex w-fit items-center rounded-md border border-[var(--surface-muted)] px-3 py-2 text-sm font-semibold text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] dark:border-gray-700"
          >
            Back to Books
          </Link>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
              {post.category}
            </p>
            <h1 className="mt-2 text-2xl font-bold leading-tight text-[var(--text)]">
              <Link
                href={`/post/${post.urlId}`}
                className="transition hover:text-[var(--accent)]"
              >
                {post.title}
              </Link>
            </h1>
            <p className="mt-2 text-sm font-medium text-[var(--text-secondary)]">
              Listed {formatDate(post.date)}
            </p>
          </div>

          <p className="text-2xl font-semibold text-[var(--text)]">
            {formatPrice(post)}
          </p>

          <p className="w-fit rounded-full bg-[#f1f1ed] px-3 py-1 text-sm font-semibold text-[var(--accent)] dark:bg-green-950 dark:text-green-300">
            {outOfStock ? "Out of stock" : `${stockQuantity} copies available`}
          </p>

          <div className="flex flex-wrap gap-2">
            {post.tags.split(",").map((tag) => (
              <span
                key={tag.trim()}
                className="rounded-full bg-[#f1f1ed] px-3 py-1 text-sm font-medium text-[var(--accent)] dark:bg-blue-950 dark:text-blue-300"
              >
                #{tag.trim()}
              </span>
            ))}
          </div>

          <div
            data-test-id="content-markdown"
            className="prose prose-sm max-h-72 max-w-none overflow-y-auto rounded-md border border-[var(--surface-muted)] bg-[var(--background)] p-4 leading-7 text-[var(--text)] dark:border-gray-700 dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: content }}
          />

          {readOnly ? null : (
            <AddToCartButton
              product={{
                id: post.id,
                urlId: post.urlId,
                title: post.title,
                price: getProductPrice(post),
                imageUrl: post.imageUrl,
                stockQuantity,
              }}
            />
          )}
        </div>
      </div>
    </article>
  );
}
