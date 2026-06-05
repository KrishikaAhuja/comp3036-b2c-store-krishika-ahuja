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

type PaymentMethod = "mock_credit_card" | "pay_on_delivery";

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

function isValidPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, "");

  return /^\d{10}$/.test(digits);
}

function getPaymentMethod(payment: CheckoutPayment): PaymentMethod {
  const method = text(payment.method);

  return method === "pay_on_delivery" ? "pay_on_delivery" : "mock_credit_card";
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

  if (!isValidPhoneNumber(phone)) {
    return "Enter any 10 digits for the phone number.";
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

function createTransactionId() {
  const now = new Date();
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const suffix = Math.floor(1000 + Math.random() * 9000);

  return `TXN-${date}-${suffix}`;
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();

  if (!user || user.role !== "CUSTOMER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Checkout request is not valid JSON." },
      { status: 400 },
    );
  }

  const checkoutBody =
    body && typeof body === "object"
      ? (body as {
          items?: unknown;
          customer?: unknown;
          payment?: unknown;
        })
      : {};
  const items = normalizeItems(checkoutBody.items);
  const detailsError = validateCheckoutDetails(
    (checkoutBody.customer || {}) as CheckoutCustomer,
    (checkoutBody.payment || {}) as CheckoutPayment,
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

  try {
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
    const paymentReference = createTransactionId();
    const paymentMethod = getPaymentMethod(
      (checkoutBody.payment || {}) as CheckoutPayment,
    );
    const orderStatus = paymentMethod === "pay_on_delivery" ? "NOT_PAID" : "PAID";

    const orderId = await client.db.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          userId: user.id,
          status: orderStatus,
          paymentProvider: paymentMethod,
          paymentReference,
          totalAud,
          items: {
            create: orderItems,
          },
        },
        select: {
          id: true,
        },
      });

      for (const item of orderItems) {
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

      return createdOrder.id;
    });

    return NextResponse.json({
      orderId,
      paymentReference,
      status: orderStatus,
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
