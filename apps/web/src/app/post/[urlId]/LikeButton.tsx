"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getCustomerLoginUrl } from "../../../utils/customerAuthRedirect";

export default function LikeButton({
  postId,
  initialLiked,
  isAuthenticated,
}: {
  postId: number;
  initialLiked: boolean;
  isAuthenticated: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState(initialLiked);

  async function handleLike() {
    // Prevent double-clicks from sending duplicate watch/unwatch requests.
    if (loading) return;

    if (!isAuthenticated) {
      window.location.assign(getCustomerLoginUrl(window.location.pathname));
      return;
    }

    setLoading(true);

    await fetch("/api/likes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ postId }),
    });

    // Refresh the server-rendered detail page so watcher counts update from the database.
    setLiked(!liked);
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      data-test-id="like-button"
      onClick={handleLike}
      disabled={loading}
      className={`rounded-xl px-5 py-2.5 font-semibold text-white shadow transition ${
        liked ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
      } ${loading ? "cursor-not-allowed opacity-60" : ""}`}
    >
      {loading ? "Updating..." : liked ? "Saved read" : "Save this read"}
    </button>
  );
}
