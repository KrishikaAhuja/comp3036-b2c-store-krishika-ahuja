import { AppLayout } from "@/components/Layout/AppLayout";
import { Main } from "@/components/Main";
import { getActiveProducts } from "@/functions/products";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; preview?: string }>;
}) {
  const { q = "", preview: previewParam } = await searchParams;
  const preview = previewParam === "admin";
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
    <AppLayout query={q} preview={preview}>
      {filteredPosts.length === 0 ? (
        <div>0 Books</div>
      ) : (
        <Main posts={filteredPosts} readOnly={preview} />
      )}
    </AppLayout>
  );
}
