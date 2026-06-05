import { AppLayout } from "@/components/Layout/AppLayout";
import { Main } from "@/components/Main";
import { getActiveProducts } from "@/functions/products";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ name: string }>;
  searchParams?: Promise<{ preview?: string }>;
}) {
  const { name } = await params;
  const preview = (await searchParams)?.preview === "admin";
  const posts = await getActiveProducts();

  // Category URLs are case-insensitive so /category/mystery and /category/Mystery behave the same.
  const filteredPosts = posts.filter(
    (post) => post.category.toLowerCase() === name.toLowerCase(),
  );

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
