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
  searchParams,
}: {
  params: Promise<{ range: string }>;
  searchParams?: Promise<{ preview?: string }>;
}) {
  const { range } = await params;
  const preview = (await searchParams)?.preview === "admin";
  const parsedRange = parseHistoryRangeSlug(range);

  if (!parsedRange) {
    notFound();
  }

  const posts = await getActiveProducts();
  const filteredPosts = posts.filter((post) =>
    isPostInHistoryRange(post, parsedRange),
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
