import { client } from "@repo/db/client"; // Prisma client wrapper used to access the database
import { requireAdmin } from "../../../utils/auth";
import { NextRequest, NextResponse } from "next/server";

// Creates a URL-safe id from the title
function makeUrlId(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function getUnauthorizedResponse() {
  try {
    await requireAdmin();
    return null;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

function getStockValidationError(value: unknown) {
  const parsedStock = Number(value);

  if (!Number.isInteger(parsedStock)) {
    return "Stock must be a whole number";
  }

  if (parsedStock < 0) {
    return "Stock cannot be negative";
  }

  return "";
}

// Gets posts from database with optional server-side filters
export async function GET(req: NextRequest) {
  const unauthorized = await getUnauthorizedResponse();

  if (unauthorized) {
    return unauthorized;
  }

  const { searchParams } = new URL(req.url);

  // Read filter values from the URL query string
  const content = searchParams.get("content") || "";
  const visibility = searchParams.get("visibility") || "";

  // Fetch only matching posts from the database
  const posts = await client.db.post.findMany({
    where: {
      AND: [
        // Filter by title
        content ? { title: { contains: content } } : {},

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
  const unauthorized = await getUnauthorizedResponse();

  if (unauthorized) {
    return unauthorized;
  }

  const body = await req.json();
  const stockError = getStockValidationError(body.stockQuantity);

  if (stockError) {
    return NextResponse.json({ error: stockError }, { status: 400 });
  }

  const updated = await client.db.post.update({
    where: { id: Number(body.id) },
    data: {
      title: body.title,
      urlId: makeUrlId(body.title),
      description: body.description,
      content: body.content,
      tags: "",
      imageUrl: body.imageUrl,
      category: body.category,
      priceAud: Math.max(0, Math.floor(Number(body.priceAud) || 0)),
      stockQuantity: Math.floor(Number(body.stockQuantity)),
      active: Boolean(body.active),
    },
  });

  return NextResponse.json(updated);
}

// Creates a new post
export async function POST(req: NextRequest) {
  const unauthorized = await getUnauthorizedResponse();

  if (unauthorized) {
    return unauthorized;
  }

  const body = await req.json();
  const stockError = getStockValidationError(body.stockQuantity);

  if (stockError) {
    return NextResponse.json({ error: stockError }, { status: 400 });
  }

  const created = await client.db.post.create({
    data: {
      title: body.title,
      urlId: makeUrlId(body.title),
      description: body.description,
      content: body.content,
      tags: "",
      imageUrl: body.imageUrl,
      category: body.category,
      priceAud: Math.max(0, Math.floor(Number(body.priceAud) || 0)),
      stockQuantity: Math.floor(Number(body.stockQuantity)),
      active: Boolean(body.active),
    },
  });

  return NextResponse.json(created);
}

