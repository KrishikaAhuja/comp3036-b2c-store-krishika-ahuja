import { AppLayout } from "@/components/Layout/AppLayout";
import { Main } from "@/components/Main";
import { posts } from "@repo/db/data";

export default async function Page({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;

  const normalizedTag = tag.toLowerCase().replaceAll("-", "");

  const filteredPosts = posts.filter((post) => {
    const normalizedPostTags = post.tags
      .toLowerCase()
      .split(",")
      .map((t) => t.trim().replaceAll("-", "").replaceAll(" ", ""));

    return post.active && normalizedPostTags.includes(normalizedTag);
  });

  return (
    <AppLayout>
      {filteredPosts.length === 0 ? (
        <div>0 Products</div>
      ) : (
        <Main posts={filteredPosts} />
      )}
    </AppLayout>
  );
}
