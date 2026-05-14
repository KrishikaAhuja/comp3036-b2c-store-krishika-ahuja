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
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
            Blog
          </p>
          <h1 className="mt-2 text-2xl font-bold text-[var(--text)]">
            Top Links and blog name
          </h1>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            Browse posts by category, date, and tag.
          </p>
        </div>

        <nav>
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