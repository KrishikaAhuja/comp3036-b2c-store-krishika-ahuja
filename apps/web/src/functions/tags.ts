export async function tags(posts: { tags: string; active: boolean }[]) {
  const tagCount: Record<string, number> = {};

  // Tags are displayed as customer-facing age ranges, excluding hidden books.
  posts
    .filter((post) => post.active)
    .forEach((post) => {
      post.tags.split(",").forEach((tag) => {
        const cleanTag = tag.trim();
        if (!cleanTag) return;

        tagCount[cleanTag] = (tagCount[cleanTag] || 0) + 1;
      });
    });

  return Object.entries(tagCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
