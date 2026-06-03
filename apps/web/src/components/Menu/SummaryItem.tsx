export function SummaryItem({
  name,
  link,
  count,
  isSelected,
  title,
}: {
  name: string;
  link: string;
  count: number;
  isSelected: boolean;
  title?: string;
}) {
  // Used by genre, age-range, and arrival menus so each link shows its book count.
  return (
    <li>
      <a
        href={link}
        title={title}
        className={`flex items-center justify-between rounded-xl px-3 py-2 text-base font-medium ${
          isSelected
            ? "selected bg-[var(--surface-muted)] text-[var(--accent)] dark:bg-blue-900/30 dark:text-blue-300"
            : "text-[var(--text-secondary)] hover:bg-[var(--background)] hover:text-[var(--text)] dark:hover:bg-gray-800"
        }`}
      >
        <span className="font-medium">{name}</span>
        <span
          data-test-id="post-count"
          className="rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-800 dark:bg-gray-300 dark:text-gray-900"
        >
          {count}
        </span>
      </a>
    </li>
  );
}
