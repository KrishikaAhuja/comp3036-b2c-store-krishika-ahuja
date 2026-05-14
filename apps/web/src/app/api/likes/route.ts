import { client } from "@repo/db/client"; // Prisma client wrapper used to access the database
import { NextRequest, NextResponse } from "next/server";

// Handles like/unlike
export async function POST(req: NextRequest) {
  const body = await req.json();

  // Get post id from request body
  const postId = Number(body.postId);

  // Uses a fixed IP for tests.
  // In a real app, this would come from request headers.
  const userIP = "test-ip";

  // Check if this user already liked this post
  const existing = await client.db.like.findUnique({
    where: {
      postId_userIP: {
        postId,
        userIP,
      },
    },
  });

  if (existing) {
    // If like already exists, remove it = unlike
    await client.db.like.delete({
      where: {
        postId_userIP: {
          postId,
          userIP,
        },
      },
    });
  } else {
    // If like does not exist, create it = like
    await client.db.like.create({
      data: {
        postId,
        userIP,
      },
    });
  }

  const response = NextResponse.json({ success: true });

  // Small cookie used to avoid counting a like refresh as a page view
  response.cookies.set("skip_view_increment", "1", {
    path: "/",
    maxAge: 2,
  });

  return response;
}