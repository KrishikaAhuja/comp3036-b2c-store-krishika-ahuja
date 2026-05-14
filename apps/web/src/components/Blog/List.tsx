import type { Post } from "@repo/db/data";
import { BlogListItem } from "./ListItem";

export function BlogList({ posts }: { posts: Post[] }) {
  const activePosts = posts.filter((post) => post.active);

  if (activePosts.length === 0) {
    return <div className="py-6">0 Posts</div>;
  }

  return (
    <div className="py-6">
      {activePosts.map((post) => (
        <BlogListItem key={post.id} post={post} />
      ))}
    </div>
  );
}

export default BlogList;