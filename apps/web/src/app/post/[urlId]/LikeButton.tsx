"use client"; // This is a client component (runs in browser)

import { useRouter } from "next/navigation"; // Used to refresh page after like
import { useState } from "react"; // React state

export default function LikeButton({
  postId,
  initialLiked,
  //props
}: {
  postId: number;
  initialLiked: boolean;
}) {
  const router = useRouter();

  // loading = to prevent multiple clicks
  const [loading, setLoading] = useState(false);

  // liked = current like state (true/false)
  const [liked, setLiked] = useState(initialLiked);

  async function handleLike() {
    // If already clicking, do nothing (prevents spam clicks)
    if (loading) return;

    setLoading(true); // start loading

    // Call backend API to like/unlike
    await fetch("/api/likes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ postId }), // send post id
    });

    // Instantly update UI (without waiting for refresh)
    setLiked(!liked);

    // Refresh server data (updates like count properly)
    router.refresh();

    setLoading(false); // stop loading
  }

  return (
    <button
      data-test-id="like-button" // used in tests
      onClick={handleLike}
      disabled={loading} // disable button while loading
      className={`px-5 py-2.5 rounded-xl font-semibold shadow transition
        ${
          liked
            ? "bg-green-600 hover:bg-green-700 text-white" // green if liked
            : "bg-blue-600 hover:bg-blue-700 text-white" // blue if not liked
        }
        ${loading ? "opacity-60 cursor-not-allowed" : ""} // faded when loading
      `}
    >
      {/* Button text changes based on state */}
      {loading ? "Updating..." : liked ? "Liked 👍" : "👍 Like"}
    </button>
  );
}