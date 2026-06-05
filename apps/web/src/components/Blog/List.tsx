import type { Post } from "@repo/db/data";
import { BlogListItem } from "./ListItem";

export function BlogList({
  posts,
  readOnly = false,
}: {
  posts: Post[];
  readOnly?: boolean;
}) {
  const activePosts = posts.filter((post) => post.active);

  if (activePosts.length === 0) {
    return <div className="py-6">0 Books</div>;
  }

  return (
    <div className="grid gap-6 py-6 sm:grid-cols-2 xl:grid-cols-3">
      {activePosts.map((post) => (
        <BlogListItem key={post.id} post={post} readOnly={readOnly} />
      ))}
    </div>
  );
}

export default BlogList;
