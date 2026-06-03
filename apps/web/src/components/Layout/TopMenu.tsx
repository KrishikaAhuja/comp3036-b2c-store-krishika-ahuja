"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CartNavLink } from "../Cart/CartNavLink";
import ThemeSwitch from "../Themes/ThemeSwitcher";

function debounce<T extends (...args: Any[]) => Any>(fn: T, delay = 300) {
  let timeoutId: Any;
  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

export function TopMenu({
  query,
  userName,
}: {
  query?: string;
  userName?: string;
}) {
  const router = useRouter();

  // Debouncing avoids pushing a new search route for every single keystroke immediately.
  const handleSearch = debounce(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const search = event.target.value;
      router.push(`/search?q=${search}`);
    },
  );

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-[var(--background)] p-4 shadow-sm md:flex-row md:items-center md:justify-between dark:border-gray-700">
      <form action="#" method="GET" className="flex-1">
        <input
          type="search"
          defaultValue={query}
          onChange={handleSearch}
          placeholder="Search books..."
          className="w-full rounded-xl border border-gray-200 bg-[var(--background)] px-4 py-3 text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-secondary)] focus:border-blue-500 dark:border-gray-700"
        />
      </form>

      <div className="flex flex-wrap items-center justify-end gap-3">
        {userName ? (
          <>
            <span className="rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-[var(--text)] dark:border-gray-700">
              Account: {userName}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-[var(--text)] hover:border-[var(--wsu)] dark:border-gray-700"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            href="/auth"
            className="rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-[var(--text)] hover:border-[var(--wsu)] dark:border-gray-700"
          >
            Sign in
          </Link>
        )}
        <CartNavLink />
        <ThemeSwitch />
      </div>
    </div>
  );
}
