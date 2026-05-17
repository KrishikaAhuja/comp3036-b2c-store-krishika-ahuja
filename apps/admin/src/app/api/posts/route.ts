import { client } from "@repo/db/client"; // Prisma client wrapper used to access the database
import { NextRequest, NextResponse } from "next/server";

// Creates a URL-safe id from the title
function makeUrlId(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Gets posts from database with optional server-side filters
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // Read filter values from the URL query string
  const content = searchParams.get("content") || "";
  const tag = searchParams.get("tag") || "";
  const visibility = searchParams.get("visibility") || "";

  // Fetch only matching posts from the database
  const posts = await client.db.post.findMany({
    where: {
      AND: [
        // Filter by title, description, or content
        content
          ? {
              OR: [
                { title: { contains: content } },
                { description: { contains: content } },
                { content: { contains: content } },
              ],
            }
          : {},

        // Filter by tag
        tag ? { tags: { contains: tag } } : {},

        // Filter by active/inactive status
        visibility === "active"
          ? { active: true }
          : visibility === "inactive"
          ? { active: false }
          : {},
      ],
    },

    // Include likes so the frontend can calculate like count
    include: {
      Likes: true,
    },
  });

  return NextResponse.json(posts);
}

// Updates an existing post
export async function PUT(req: NextRequest) {
  const body = await req.json();

  const updated = await client.db.post.update({
    where: { id: Number(body.id) },
    data: {
      title: body.title,
      urlId: makeUrlId(body.title),
      description: body.description,
      content: body.content,
      tags: body.tags,
      imageUrl: body.imageUrl,
      category: body.category,
      priceAud: Math.max(0, Math.floor(Number(body.priceAud) || 0)),
      stockQuantity: Math.max(0, Math.floor(Number(body.stockQuantity) || 0)),
      active: Boolean(body.active),
      date: new Date(),
    },
  });

  return NextResponse.json(updated);
}

// Creates a new post
export async function POST(req: NextRequest) {
  const body = await req.json();

  const created = await client.db.post.create({
    data: {
      title: body.title,
      urlId: makeUrlId(body.title),
      description: body.description,
      content: body.content,
      tags: body.tags,
      imageUrl: body.imageUrl,
      category: body.category,
      priceAud: Math.max(0, Math.floor(Number(body.priceAud) || 0)),
      stockQuantity: Math.max(0, Math.floor(Number(body.stockQuantity) || 0)),
      active: Boolean(body.active),
    },
  });

  return NextResponse.json(created);
}

// Toggles post between active and inactive
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const postId = Number(id);

  // Find the post first
  const post = await client.db.post.findUnique({
    where: { id: postId },
  });

  // If post does not exist, return 404
  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Flip active value
  const updated = await client.db.post.update({
    where: { id: postId },
    data: {
      active: !post.active,
    },
  });

  return NextResponse.json(updated);
}
