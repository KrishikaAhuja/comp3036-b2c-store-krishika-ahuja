import { client } from "@repo/db/client";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../utils/auth";

type CheckoutItem = {
  id?: unknown;
  quantity?: unknown;
};

function normalizeItems(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item: CheckoutItem) => ({
      id: Number(item?.id),
      quantity: Math.floor(Number(item?.quantity)),
    }))
    .filter((item) => Number.isInteger(item.id) && item.id > 0 && item.quantity > 0);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();

  if (!user || user.role !== "CUSTOMER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const items = normalizeItems(body.items);

  if (items.length === 0) {
    return NextResponse.json(
      { error: "Your book bag is empty." },
      { status: 400 },
    );
  }

  const books = await client.db.post.findMany({
    where: {
      id: {
        in: items.map((item) => item.id),
      },
      active: true,
    },
    select: {
      id: true,
      title: true,
      urlId: true,
      imageUrl: true,
      priceAud: true,
      stockQuantity: true,
    },
  });

  const orderItems = items.map((item) => {
    const book = books.find((candidate) => candidate.id === item.id);

    if (!book) {
      throw new Error("A book in your bag is no longer available.");
    }

    if (book.stockQuantity < item.quantity) {
      throw new Error(`${book.title} does not have enough stock.`);
    }

    const unitPriceAud = book.priceAud;

    return {
      postId: book.id,
      title: book.title,
      urlId: book.urlId,
      imageUrl: book.imageUrl,
      unitPriceAud,
      quantity: item.quantity,
      lineTotalAud: unitPriceAud * item.quantity,
    };
  });

  const totalAud = orderItems.reduce((total, item) => total + item.lineTotalAud, 0);
  const paymentReference = `mock-${Date.now()}`;

  try {
    const orderId = await client.db.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(
        `INSERT INTO "Order" ("userId", "status", "paymentProvider", "paymentReference", "totalAud", "updatedAt")
         VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        user.id,
        "PAID",
        "mock",
        paymentReference,
        totalAud,
      );

      const rows = await tx.$queryRawUnsafe<{ id: number }[]>(
        `SELECT last_insert_rowid() AS id`,
      );
      const createdOrderId = Number(rows[0]?.id);

      for (const item of orderItems) {
        await tx.$executeRawUnsafe(
          `INSERT INTO "OrderItem" ("orderId", "postId", "title", "urlId", "imageUrl", "unitPriceAud", "quantity", "lineTotalAud")
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          createdOrderId,
          item.postId,
          item.title,
          item.urlId,
          item.imageUrl,
          item.unitPriceAud,
          item.quantity,
          item.lineTotalAud,
        );

        await tx.post.update({
          where: {
            id: item.postId,
          },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      return createdOrderId;
    });

    return NextResponse.json({
      orderId,
      paymentReference,
      status: "PAID",
      totalAud,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Checkout could not be completed.",
      },
      { status: 400 },
    );
  }
}
