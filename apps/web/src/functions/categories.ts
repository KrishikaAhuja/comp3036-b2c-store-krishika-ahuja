// import { posts, type Post } from "../components/data";

export function categories(
  posts: { category: string; active: boolean }[],
): { name: string; count: number }[] {
  const map: Record<string, number> = {};

  posts
    .filter((p) => p.active)
    .forEach((post) => {
      const name = post.category.trim();
      map[name] = (map[name] || 0) + 1;
    });

  

  return Object.entries(map)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}