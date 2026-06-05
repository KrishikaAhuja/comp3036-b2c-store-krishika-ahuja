"use client";

import { UserCircleIcon } from "@heroicons/react/24/outline";
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
  preview = false,
}: {
  query?: string;
  userName?: string;
  preview?: boolean;
}) {
  const router = useRouter();

  // Debouncing avoids pushing a new search route for every single keystroke immediately.
  const handleSearch = debounce(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const search = event.target.value;
      const params = new URLSearchParams();

      if (search) {
        params.set("q", search);
      }

      if (preview) {
        params.set("preview", "admin");
      }

      router.push(`/search?${params.toString()}`);
    },
  );

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-[var(--surface-muted)] bg-[var(--surface)] p-4 shadow-sm md:flex-row md:items-center md:justify-between dark:border-gray-700">
      <form action="#" method="GET" className="flex-1">
        <input
          type="search"
          defaultValue={query}
          onChange={handleSearch}
          placeholder="Search books..."
          className="w-full rounded-xl border border-[var(--surface-muted)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-secondary)] focus:border-[var(--accent)] dark:border-gray-700"
        />
      </form>

      <div className="flex flex-wrap items-center justify-end gap-3">
        {preview ? null : userName ? (
          <>
            <span
              className="inline-flex items-center gap-2 rounded-md border border-[var(--surface-muted)] px-3 py-2 text-sm font-medium text-[var(--text)] dark:border-gray-700"
              aria-label={`Signed in as ${userName}`}
              title={`Signed in as ${userName}`}
            >
              <UserCircleIcon className="h-5 w-5" aria-hidden="true" />
              <span>{userName}</span>
            </span>
            <Link
              href="/purchase-history"
              className="rounded-md border border-[var(--surface-muted)] px-3 py-2 text-sm font-medium text-[var(--text)] hover:border-[var(--accent)] dark:border-gray-700"
            >
              Purchase History
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md border border-[var(--surface-muted)] px-3 py-2 text-sm font-medium text-[var(--text)] hover:border-[var(--accent)] dark:border-gray-700"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            href="/auth"
            className="rounded-md border border-[var(--surface-muted)] px-3 py-2 text-sm font-medium text-[var(--text)] hover:border-[var(--accent)] dark:border-gray-700"
          >
            Sign in
          </Link>
        )}
        {preview ? null : <CartNavLink />}
        <ThemeSwitch />
      </div>
    </div>
  );
}
