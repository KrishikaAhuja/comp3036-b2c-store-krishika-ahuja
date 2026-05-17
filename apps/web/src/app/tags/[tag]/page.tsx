import { AppLayout } from "@/components/Layout/AppLayout";
import { Main } from "@/components/Main";
import { getActiveProducts } from "@/functions/products";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const posts = await getActiveProducts();

  const normalizedTag = tag.toLowerCase().replaceAll("-", "");

  const filteredPosts = posts.filter((post) => {
    const normalizedPostTags = post.tags
      .toLowerCase()
      .split(",")
      .map((t) => t.trim().replaceAll("-", "").replaceAll(" ", ""));

    return normalizedPostTags.includes(normalizedTag);
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
