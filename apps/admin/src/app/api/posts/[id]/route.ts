import { client } from "@repo/db/client"; // Prisma client wrapper used to access the database
import { requireAdmin } from "../../../../utils/auth";
import { NextRequest, NextResponse } from "next/server";

async function getUnauthorizedResponse() {
  try {
    await requireAdmin();
    return null;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// Handles activate/deactivate for one post
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const unauthorized = await getUnauthorizedResponse();

  if (unauthorized) {
    return unauthorized;
  }

  // Get post id from the route, for example /api/posts/1
  const { id } = await context.params;
  const postId = Number(id);

  // Find the post in the database
  const post = await client.db.post.findUnique({
    where: { id: postId },
  });

  // If post does not exist, return error
  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Toggle active status
  const updated = await client.db.post.update({
    where: { id: postId },
    data: {
      active: !post.active,
    },
  });

  return NextResponse.json(updated);
}

// Deletes one product while keeping the existing posts API route.
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const unauthorized = await getUnauthorizedResponse();

  if (unauthorized) {
    return unauthorized;
  }

  const { id } = await context.params;
  const postId = Number(id);

  await client.db.post.delete({
    where: { id: postId },
  });

  return NextResponse.json({ ok: true });
}
