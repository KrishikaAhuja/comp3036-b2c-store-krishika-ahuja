export function history(posts: { date: Date; active: boolean }[]) {
  const counts: Record<string, { year: number; month: number; count: number }> = {};

  // Group active products by arrival month for the storefront sidebar.
  posts
    .filter((post) => post.active)
    .forEach((post) => {
      const date = new Date(post.date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      const key = `${year}-${month}`;

      if (!counts[key]) {
        counts[key] = { year, month, count: 1 };
      } else {
        counts[key].count++;
      }
    });

  // Newest arrival groups appear first for customers browsing recent products.
  return Object.values(counts).sort((a, b) => {
    if (b.year !== a.year) return b.year - a.year;
    return b.month - a.month;
  });
}
