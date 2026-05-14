import { AppLayout } from "@/components/Layout/AppLayout";
import { Main } from "@/components/Main";
import { posts } from "@repo/db/data";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.toLowerCase();

  const filteredPosts = posts.filter(
    (post) =>
      post.active &&
      (post.title.toLowerCase().includes(query) ||
        post.description.toLowerCase().includes(query))
  );

  return (
    <AppLayout>
      {filteredPosts.length === 0 ? (
        <div>0 Posts</div>
      ) : (
        <Main posts={filteredPosts} />
      )}
    </AppLayout>
  );
}