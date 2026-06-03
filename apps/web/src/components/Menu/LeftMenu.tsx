import type { Post } from "@repo/db/data";
import { CategoryList } from "./CategoryList";
import { HistoryList } from "./HistoryList";
import { TagList } from "./TagList";
import Link from "next/link";

export async function LeftMenu({ posts }: { posts: Post[] }) {
  return (
    <aside className="w-full lg:w-72 lg:flex-shrink-0">
      <div className="rounded-2xl border border-gray-200 bg-[var(--background)] p-6 shadow-sm dark:border-gray-700">
        <div className="mb-8">
          <Link
            href="/"
            className="mb-4 inline-flex text-sm font-semibold text-[var(--text-secondary)] transition hover:text-blue-600"
          >
            &larr; All Books
          </Link>
          <Link
            href="/"
            className="block text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 transition hover:text-blue-700"
          >
            Bookstore
          </Link>
          <Link
            href="/"
            className="mt-2 block text-2xl font-bold text-[var(--text)] transition hover:text-blue-600"
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
              <HistoryList selectedYear="" selectedMonth="" posts={posts} />
            </li>
            <li>
              <TagList selectedTag="" posts={posts} />
            </li>
            <li>
              <Link
                href="http://localhost:3002"
                className="block rounded-xl bg-gray-50 px-4 py-3 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
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
