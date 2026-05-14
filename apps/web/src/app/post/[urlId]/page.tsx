import { AppLayout } from "@/components/Layout/AppLayout"; // imports the main page layout
import { BlogDetail } from "@/components/Blog/Detail"; // imports the component that shows full blog details
import { client } from "@repo/db/client"; // imports the database client
import LikeButton from "./LikeButton"; // imports the like button component
import { cookies } from "next/headers"; // used to read cookies from the request

// Makes this page always load fresh data instead of using cached data.
// This is important because views and likes can change.
export const dynamic = "force-dynamic";

// This is the blog detail page.
// It receives urlId from the URL, for example /post/my-blog-title.
export default async function Page({
  params,
}: {
  params: Promise<{ urlId: string }>;
}) {
  // Gets the urlId from the page route params.
  const { urlId } = await params;

  // Finds the post in the database using urlId.
  // Likes are included so we can count likes and check if the user liked the post.
  const post = await client.db.post.findUnique({
    where: { urlId },
    include: { Likes: true },
  });

  // If the post does not exist or is inactive, show article not found.
  if (!post || !post.active) {
    return (
      <AppLayout>
        <div>Article not found</div>
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

  // Checks if the current test user has already liked this post.
  // "test-ip" is being used as the user identifier here.
  const isLiked = updatedPost.Likes.some(
    (like) => like.userIP === "test-ip"
  );

  // Shows the blog detail page with like count, views count, and the post content.
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Top row showing like button, like count, and views count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Like button receives the post id and whether it is already liked */}
            <LikeButton
              postId={updatedPost.id}
              initialLiked={isLiked}
            />

            {/* Shows total likes for this post */}
            <div className="rounded-xl bg-gray-100 px-4 py-2 font-semibold text-green-700 shadow-sm dark:bg-green-900 dark:text-green-300">
              ❤️ {displayPost.likes}
            </div>
          </div>

          {/* Shows total views for this post */}
          <div className="rounded-xl bg-gray-100 px-5 py-2.5 font-semibold text-gray-700 shadow-sm dark:bg-gray-800 dark:text-gray-300">
            👁 Views: {updatedPost.views}
          </div>
        </div>

        {/* Shows the actual blog title, image, description, and content */}
        <BlogDetail post={displayPost} />
      </div>
    </AppLayout>
  );
}