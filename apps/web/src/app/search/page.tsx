import { AppLayout } from "@/components/Layout/AppLayout";
import { Main } from "@/components/Main";
import { getActiveProducts } from "@/functions/products";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.toLowerCase();
  // Search runs on the active catalogue only, keeping hidden admin products out of results.
  const posts = await getActiveProducts();

  // Match simple customer search terms against the product name and short description.
  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(query) ||
      post.description.toLowerCase().includes(query),
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
