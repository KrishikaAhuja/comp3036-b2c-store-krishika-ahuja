import { AppLayout } from "@/components/Layout/AppLayout";
import { Main } from "@/components/Main";
import { posts } from "@repo/db/data";

export default async function Page({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;

  const filteredPosts = posts.filter(
  (post) => post.category.toLowerCase() === name.toLowerCase() && post.active
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