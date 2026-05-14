import { AppLayout } from "@/components/Layout/AppLayout";
import { Main } from "@/components/Main";
import { posts } from "@repo/db/data";

export default async function Page({
  params,
}: {
  params: Promise<{ year: string; month: string }>;
}) {
  const { year, month } = await params;

  const filteredPosts = posts.filter((post) => {
    const date = new Date(post.date);
    return (
      post.active &&
      String(date.getFullYear()) === year &&
      String(date.getMonth() + 1) === month
    );
  });

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