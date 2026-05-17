import { AppLayout } from "@/components/Layout/AppLayout";
import { Main } from "@/components/Main";
import { getActiveProducts } from "@/functions/products";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ year: string; month: string }>;
}) {
  const { year, month } = await params;
  const posts = await getActiveProducts();

  const filteredPosts = posts.filter((post) => {
    const date = new Date(post.date);
    return (
      String(date.getFullYear()) === year &&
      String(date.getMonth() + 1) === month
    );
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
