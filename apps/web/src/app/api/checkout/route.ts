import { client } from "@repo/db/client";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../utils/auth";

type CheckoutItem = {
  id?: unknown;
  quantity?: unknown;
};

type CheckoutCustomer = {
  fullName?: unknown;
  email?: unknown;
  phone?: unknown;
  deliveryAddress?: unknown;
};

type CheckoutPayment = {
  method?: unknown;
  cardholderName?: unknown;
  cardNumber?: unknown;
  expiryDate?: unknown;
  cvv?: unknown;
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

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function validateCheckoutDetails(customer: CheckoutCustomer, payment: CheckoutPayment) {
  const fullName = text(customer.fullName);
  const email = text(customer.email);
  const phone = text(customer.phone);
  const deliveryAddress = text(customer.deliveryAddress);
  const method = text(payment.method) || "mock_credit_card";

  if (!fullName) {
    return "Full name is required.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Enter a valid email address.";
  }

  if (!phone) {
    return "Phone number is required.";
  }

  if (!deliveryAddress) {
    return "Delivery address is required.";
  }

  if (method !== "mock_credit_card" && method !== "pay_on_delivery") {
    return "Select a valid payment method.";
  }

  if (method === "mock_credit_card") {
    const cardholderName = text(payment.cardholderName);
    const cardNumber = text(payment.cardNumber);
    const cardDigits = cardNumber.replace(/ /g, "");
    const expiryDate = text(payment.expiryDate);
    const cvv = text(payment.cvv);

    if (!cardholderName) {
      return "Cardholder name is required.";
    }

    if (!cardNumber) {
      return "Card number is required.";
    }

    if (!/^[\d ]+$/.test(cardNumber)) {
      return "Card number can only contain numbers and spaces.";
    }

    if (!/^\d{16}$/.test(cardDigits)) {
      return "Card number must contain exactly 16 digits.";
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) {
      return "Expiry date must use MM/YY format.";
    }

    if (!/^\d{3}$/.test(cvv)) {
      return "CVV must contain exactly 3 digits.";
    }
  }

  return "";
}

function createMockTransactionId() {
  const now = new Date();
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const suffix = Math.floor(1000 + Math.random() * 9000);

  return `MOCK-${date}-${suffix}`;
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();

  if (!user || user.role !== "CUSTOMER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const items = normalizeItems(body.items);
  const detailsError = validateCheckoutDetails(
    (body.customer || {}) as CheckoutCustomer,
    (body.payment || {}) as CheckoutPayment,
  );

  if (items.length === 0) {
    return NextResponse.json(
      { error: "Your book bag is empty." },
      { status: 400 },
    );
  }

  if (detailsError) {
    return NextResponse.json({ error: detailsError }, { status: 400 });
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
  const paymentReference = createMockTransactionId();

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

        const updated = await tx.post.updateMany({
          where: {
            id: item.postId,
            stockQuantity: {
              gte: item.quantity,
            },
          },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        });

        if (updated.count !== 1) {
          throw new Error(`${item.title} does not have enough stock.`);
        }
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
