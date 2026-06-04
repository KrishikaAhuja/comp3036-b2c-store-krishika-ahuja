import { AppLayout } from "@/components/Layout/AppLayout";
import { Main } from "@/components/Main";
import {
  isPostInHistoryRange,
  parseHistoryRangeSlug,
} from "@/functions/history";
import { getActiveProducts } from "@/functions/products";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ range: string }>;
}) {
  const { range } = await params;
  const parsedRange = parseHistoryRangeSlug(range);

  if (!parsedRange) {
    notFound();
  }

  const posts = await getActiveProducts();
  const filteredPosts = posts.filter((post) =>
    isPostInHistoryRange(post, parsedRange),
  );

  return (
    <AppLayout>
      {filteredPosts.length === 0 ? (
        <div>0 Books</div>
      ) : (
        <Main posts={filteredPosts} />
      )}
    </AppLayout>
  );
}
