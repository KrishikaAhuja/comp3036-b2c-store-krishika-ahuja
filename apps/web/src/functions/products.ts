import { client } from "@repo/db/client";
import type { Post } from "@repo/db/data";

function withLikeCount(
  posts: Awaited<ReturnType<typeof client.db.post.findMany>>,
): Post[] {
  // Prisma returns related Like records; the storefront expects a simple numeric watcher count.
  return posts.map((post) => ({
    ...post,
    likes: "Likes" in post && Array.isArray(post.Likes) ? post.Likes.length : 0,
  }));
}

export async function getProducts(): Promise<Post[]> {
  const posts = await client.db.post.findMany({
    orderBy: {
      date: "desc",
    },
    include: {
      Likes: true,
    },
  });

  return withLikeCount(posts);
}

export async function getActiveProducts(): Promise<Post[]> {
  // Customer-facing screens should never show products hidden by the admin.
  const posts = await client.db.post.findMany({
    where: {
      active: true,
    },
    orderBy: {
      date: "desc",
    },
    include: {
      Likes: true,
    },
  });

  return withLikeCount(posts);
}
