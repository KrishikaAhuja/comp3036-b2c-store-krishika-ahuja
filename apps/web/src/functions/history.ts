export type HistoryRange = {
  startYear: number;
  endYear: number;
  count: number;
};

export function getHistoryRange(year: number) {
  const startYear = Math.floor(year / 10) * 10;

  return {
    startYear,
    endYear: startYear + 9,
  };
}

export function getHistoryRangeSlug(startYear: number, endYear: number) {
  return `${startYear}-${endYear}`;
}

export function parseHistoryRangeSlug(slug: string) {
  const match = slug.match(/^(\d{4})-(\d{4})$/);

  if (!match) {
    return null;
  }

  const startYear = Number(match[1]);
  const endYear = Number(match[2]);

  if (!Number.isInteger(startYear) || endYear !== startYear + 9) {
    return null;
  }

  return {
    startYear,
    endYear,
  };
}

export function isPostInHistoryRange(
  post: { date: Date },
  range: { startYear: number; endYear: number },
) {
  const year = new Date(post.date).getFullYear();

  return year >= range.startYear && year <= range.endYear;
}

export function history(posts: { date: Date; active: boolean }[]): HistoryRange[] {
  const counts: Record<string, HistoryRange> = {};

  // Group active products by arrival decade so the sidebar stays compact.
  posts
    .filter((post) => post.active)
    .forEach((post) => {
      const date = new Date(post.date);
      const { startYear, endYear } = getHistoryRange(date.getFullYear());
      const key = getHistoryRangeSlug(startYear, endYear);

      if (!counts[key]) {
        counts[key] = { startYear, endYear, count: 1 };
      } else {
        counts[key].count++;
      }
    });

  // Newest ranges appear first for customers browsing recent products.
  return Object.values(counts).sort((a, b) => b.startYear - a.startYear);
}
