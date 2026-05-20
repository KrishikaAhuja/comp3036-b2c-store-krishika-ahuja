import type { Post } from "@repo/db/data";
import BlogList from "./Blog/List";

export function Main({
  posts,
  className,
}: {
  posts: Post[];
  className?: string;
}) {
  // Keeps route pages small: they fetch/filter products, then hand display to the catalogue grid.
  return (
    <main className={className}>
      <BlogList posts={posts} />
    </main>
  );
}
