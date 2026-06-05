import type { Post } from "@repo/db/data";
import { BookOpenIcon } from "@heroicons/react/24/outline";
import { CategoryList } from "./CategoryList";
import { HistoryList } from "./HistoryList";
import { TagList } from "./TagList";
import Link from "next/link";

export async function LeftMenu({
  posts,
  preview = false,
}: {
  posts: Post[];
  preview?: boolean;
}) {
  return (
    <aside
      className={
        preview
          ? "w-full md:w-72 md:flex-shrink-0"
          : "w-full lg:w-72 lg:flex-shrink-0"
      }
    >
      <div className="rounded-2xl border border-[var(--surface-muted)] bg-[var(--surface)] p-6 shadow-sm dark:border-gray-700">
        <div className="mb-8">
          <Link
            href="/"
            className="group flex items-center gap-3 rounded-xl transition hover:text-[var(--accent)]"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--surface)] shadow-sm transition group-hover:bg-[var(--accent-hover)]">
              <BookOpenIcon className="h-6 w-6" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)] transition group-hover:text-[var(--accent-hover)]">
                Bookstore
              </span>
              <span className="mt-1 block text-2xl font-bold text-[var(--text)] transition group-hover:text-[var(--accent)]">
                Books
              </span>
            </span>
          </Link>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            Browse books by genre, arrival date, and age range.
          </p>
        </div>

        <nav>
          {/* These lists give customers multiple ways to browse the same active product catalogue. */}
          <ul role="list" className="flex flex-col gap-8">
            <li>
              <CategoryList posts={posts} preview={preview} />
            </li>
            <li>
              <HistoryList selectedRange="" posts={posts} preview={preview} />
            </li>
            <li>
              <TagList selectedTag="" posts={posts} preview={preview} />
            </li>
            <li>
              {preview ? null : (
                <Link
                  href="http://localhost:3002"
                  className="block rounded-xl bg-[var(--background)] px-4 py-3 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-muted)] dark:bg-gray-800 dark:hover:bg-gray-700"
                >
                  Admin
                </Link>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
}
