import { AppLayout } from "@/components/Layout/AppLayout";
import { Main } from "@/components/Main";
import { getActiveProducts } from "@/functions/products";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ tag: string }>;
  searchParams?: Promise<{ preview?: string }>;
}) {
  const { tag } = await params;
  const preview = (await searchParams)?.preview === "admin";
  const posts = await getActiveProducts();

  // Normalize route text and stored age ranges so "Ages 12+" matches /tags/ages-12.
  const normalizedTag = tag.toLowerCase().replace(/[^a-z0-9]/g, "");

  const filteredPosts = posts.filter((post) => {
    const normalizedPostTags = post.tags
      .toLowerCase()
      .split(",")
      .map((t) => t.trim().replace(/[^a-z0-9]/g, ""));

    return normalizedPostTags.includes(normalizedTag);
  });

  return (
    <AppLayout preview={preview}>
      {filteredPosts.length === 0 ? (
        <div>0 Books</div>
      ) : (
        <Main posts={filteredPosts} readOnly={preview} />
      )}
    </AppLayout>
  );
}
