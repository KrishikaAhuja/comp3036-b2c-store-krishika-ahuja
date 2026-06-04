import type { Post } from "@repo/db/data";
import { CategoryList } from "./CategoryList";
import { HistoryList } from "./HistoryList";
import { TagList } from "./TagList";
import Link from "next/link";

export async function LeftMenu({ posts }: { posts: Post[] }) {
  return (
    <aside className="w-full lg:w-72 lg:flex-shrink-0">
      <div className="rounded-2xl border border-[var(--surface-muted)] bg-[var(--surface)] p-6 shadow-sm dark:border-gray-700">
        <div className="mb-8">
          <Link
            href="/"
            className="mb-4 inline-flex text-sm font-semibold text-[var(--text-secondary)] transition hover:text-[var(--accent)]"
          >
            &larr; All Books
          </Link>
          <Link
            href="/"
            className="block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)] transition hover:text-[var(--accent-hover)]"
          >
            Bookstore
          </Link>
          <Link
            href="/"
            className="mt-2 block text-2xl font-bold text-[var(--text)] transition hover:text-[var(--accent)]"
          >
            Books
          </Link>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            Browse books by genre, arrival date, and age range.
          </p>
        </div>

        <nav>
          {/* These lists give customers multiple ways to browse the same active product catalogue. */}
          <ul role="list" className="flex flex-col gap-8">
            <li>
              <CategoryList posts={posts} />
            </li>
            <li>
              <HistoryList selectedRange="" posts={posts} />
            </li>
            <li>
              <TagList selectedTag="" posts={posts} />
            </li>
            <li>
              <Link
                href="http://localhost:3002"
                className="block rounded-xl bg-[var(--background)] px-4 py-3 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-muted)] dark:bg-gray-800 dark:hover:bg-gray-700"
              >
                Admin
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
}
