import { AppLayout } from "@/components/Layout/AppLayout"; // imports the main page layout
import { BlogDetail } from "@/components/Blog/Detail"; // imports the component that shows full product details
import { client } from "@repo/db/client"; // imports the database client
import { cookies } from "next/headers"; // used to read cookies from the request

// Makes this page always load fresh data instead of using cached data.
// This is important because views and likes can change.
export const dynamic = "force-dynamic";

// This is the product detail page.
// It receives urlId from the existing /post route.
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ urlId: string }>;
  searchParams?: Promise<{ preview?: string }>;
}) {
  // Gets the urlId from the page route params.
  const { urlId } = await params;
  const preview = (await searchParams)?.preview === "admin";

  // Finds the product in the database using the legacy urlId field.
  // Likes are included so we can count likes and check if the user liked the post.
  const post = await client.db.post.findUnique({
    where: { urlId },
    include: { Likes: true },
  });

  // If the product does not exist or is inactive, customers should not be able to view it.
  if (!post || !post.active) {
    return (
      <AppLayout>
        <div>Book not found</div>
      </AppLayout>
    );
  }

  // Reads cookies from the request.
  const cookieStore = await cookies();

  // Checks if the skip_view_increment cookie is set.
  // This is useful for tests so views do not increase when they should not.
  const skipViewIncrement =
    cookieStore.get("skip_view_increment")?.value === "1";

  // If skipViewIncrement is true, use the original post.
  // Otherwise, update the post and increase the views count by 1.
  const updatedPost = skipViewIncrement
    ? post
    : await client.db.post.update({
        where: { urlId },
        data: {
          views: { increment: 1 },
        },
        include: { Likes: true },
      });

  // Creates a display version of the post.
  // It adds a likes number based on how many Like records exist.
  const displayPost = {
    ...updatedPost,
    likes: updatedPost.Likes.length,
  };

  // Shows the book detail page with cover, metadata, and markdown content.
  return (
    <AppLayout preview={preview}>
      <BlogDetail post={displayPost} readOnly={preview} />
    </AppLayout>
  );
}
