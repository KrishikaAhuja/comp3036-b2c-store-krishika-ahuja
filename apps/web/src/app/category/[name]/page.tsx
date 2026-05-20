import { AppLayout } from "@/components/Layout/AppLayout";
import { Main } from "@/components/Main";
import { getActiveProducts } from "@/functions/products";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const posts = await getActiveProducts();

  // Category URLs are case-insensitive so /category/audio and /category/Audio behave the same.
  const filteredPosts = posts.filter(
    (post) => post.category.toLowerCase() === name.toLowerCase(),
  );

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
