"use client";

import type { Post } from "@repo/db/data";
import Link from "next/link";
import { useState } from "react";
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

function getProductPrice(post: Post) {
  return post.priceAud ?? Math.max(post.views, 1);
}

function getStockQuantity(post: Post) {
  return post.stockQuantity ?? post.likes;
}

export function BlogListItem({ post }: { post: Post }) {
  const [opened, setOpened] = useState(false);
  const stockQuantity = getStockQuantity(post);
  const outOfStock = stockQuantity <= 0;

  return (
    <article
      className={`h-full [perspective:1200px] ${outOfStock ? "opacity-75 grayscale-[0.2]" : ""}`}
      data-test-id={`blog-post-${post.id}`}
    >
      <div className="relative min-h-[29rem] rounded-lg [transform-style:preserve-3d]">
        <div className="absolute inset-0 flex flex-col overflow-hidden rounded-lg border border-[var(--surface-muted)] bg-[var(--surface)] p-5 shadow-sm dark:border-gray-700">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
              {post.category}
            </p>
            <button
              type="button"
              onClick={() => setOpened(false)}
              className="rounded-md border border-[var(--surface-muted)] px-2.5 py-1.5 text-xs font-semibold text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] dark:border-gray-700"
            >
              Back to cover
            </button>
          </div>

          <Link
            href={`/post/${post.urlId}`}
            className="mt-4 text-lg font-semibold leading-snug text-[var(--foreground)] transition hover:text-[var(--accent)]"
          >
            {post.title}
          </Link>

          <p className="mt-2 text-xs font-medium text-[var(--text-secondary)]">
            Listed <span>{formatDate(post.date)}</span>
          </p>

          <p className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
            {formatPrice(post)}
          </p>

          <p className="mt-4 line-clamp-4 text-sm leading-6 text-[var(--text-secondary)]">
            {post.description}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.split(",").map((tag) => (
              <span
                key={tag.trim()}
                className="rounded-md bg-[#f1f1ed] px-2.5 py-1 text-xs font-medium text-[var(--accent)] dark:bg-gray-800 dark:text-gray-300"
              >
                #{tag.trim()}
              </span>
            ))}
          </div>

          <div className="mt-auto flex items-center justify-between gap-4 border-t border-gray-200 pt-4 text-sm text-[var(--text-secondary)] dark:border-gray-700">
            <p>{outOfStock ? "Out of stock" : `${stockQuantity} copies left`}</p>
            <p>{post.likes} saving this read</p>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
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
            <Link
              href={`/post/${post.urlId}`}
              className="inline-flex h-10 items-center justify-center rounded-md bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--surface)] transition hover:bg-[var(--accent-hover)]"
            >
              View Book
            </Link>
          </div>
        </div>

        <div
          className={`absolute inset-0 z-10 flex origin-left flex-col overflow-hidden rounded-lg border border-[var(--surface-muted)] bg-[var(--surface)] shadow-sm transition-transform duration-700 [backface-visibility:hidden] [transform-style:preserve-3d] dark:border-gray-700 ${
            opened ? "[transform:rotateY(-118deg)]" : ""
          }`}
          aria-hidden={opened}
        >
          <Link
            href={`/post/${post.urlId}`}
            className="flex min-h-[29rem] items-center justify-center bg-[#f1f1ed] p-4 dark:bg-gray-800"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.imageUrl}
              alt={post.title}
              className="max-h-[25rem] w-full object-contain drop-shadow-xl"
            />
          </Link>

          <button
            type="button"
            onClick={() => setOpened(true)}
            aria-label={`Flip ${post.title} to details`}
            title="Flip me"
            className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-l-md border border-[var(--accent)] bg-[var(--surface)] px-2 py-1.5 text-xs font-semibold text-[var(--accent)] shadow-md transition hover:bg-[var(--accent)] hover:text-[var(--surface)] dark:border-gray-700"
          >
            <span>Flip me</span>
            <span className="h-0 w-0 border-y-[6px] border-l-[9px] border-y-transparent border-l-current" />
          </button>
        </div>
      </div>
    </article>
  );
}
