import { client } from "@repo/db/client";
import { seed } from "@repo/db/seed";
import { expect, test, type APIRequestContext, type Page } from "./fixtures";

function uniqueCustomerEmail() {
  return `cart-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(value);
}

async function registerCustomer(page: Page, email: string, password: string) {
  const registerResponse = await page.request.post("/api/auth/register", {
    data: {
      name: "Cart Customer",
      email,
      password,
    },
  });
  expect(registerResponse.status()).toBe(201);

  const loginResponse = await page.request.post("/api/auth/login", {
    data: {
      email,
      password,
    },
  });
  expect(loginResponse.status()).toBe(200);

  const authCookie = loginResponse
    .headers()["set-cookie"]
    ?.match(/customer_auth_token=([^;]+)/)?.[1];

  expect(authCookie).toBeTruthy();

  await page.context().addCookies([
    {
      name: "customer_auth_token",
      value: authCookie!,
      url: "http://localhost:3001",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
}

async function registerCustomerForApi(
  request: APIRequestContext,
  email: string,
  password: string,
) {
  const registerResponse = await request.post("/api/auth/register", {
    data: {
      name: "Cart Customer",
      email,
      password,
    },
  });
  expect(registerResponse.status()).toBe(201);

  const loginResponse = await request.post("/api/auth/login", {
    data: {
      email,
      password,
    },
  });
  expect(loginResponse.status()).toBe(200);
}

async function getCheckoutProduct() {
  const product = await client.db.post.findFirst({
    where: {
      active: true,
      stockQuantity: {
        gte: 2,
      },
    },
    orderBy: {
      id: "asc",
    },
    select: {
      id: true,
      urlId: true,
      title: true,
      imageUrl: true,
      priceAud: true,
      stockQuantity: true,
    },
  });

  if (!product) {
    throw new Error("Seed data must include an active product with at least two in stock.");
  }

  return product;
}

test.beforeEach(async () => {
  await seed();
});

test.describe("customer book bag", () => {
  test("unauthenticated add redirects to customer sign in", { tag: "@a1" }, async ({ page }) => {
    const product = await getCheckoutProduct();

    await page.goto("/", { waitUntil: "domcontentloaded" });

    const card = page.getByTestId(`blog-post-${product.id}`);
    await card
      .getByRole("button", { name: `Flip ${product.title} to details` })
      .click();
    await page.waitForTimeout(800);
    await card.getByRole("button", { name: "Add to Book Bag" }).click();
    await expect(page).toHaveURL("/auth?next=%2F");
  });

  test("signed-in customer can checkout with card payment", { tag: "@a1" }, async ({ page }) => {
    const product = await getCheckoutProduct();
    const checkoutQuantity = 2;
    const expectedTotal = product.priceAud * checkoutQuantity;

    const email = uniqueCustomerEmail();
    await registerCustomer(page, email, "password123");

    await page.goto("/", { waitUntil: "domcontentloaded" });
    const card = page.getByTestId(`blog-post-${product.id}`);
    await card
      .getByRole("button", { name: `Flip ${product.title} to details` })
      .click();
    await card.getByRole("button", { name: "Add to Book Bag" }).click();
    await expect(card.getByRole("button", { name: "Added to Book Bag" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Book Bag (1)" })).toBeVisible();

    await page.goto("/cart", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Book Bag" })).toBeVisible();
    await expect(page.getByText(product.title)).toBeVisible();
    await expect(
      page.getByText(formatPrice(product.priceAud), { exact: true }).last(),
    ).toBeVisible();

    await page
      .getByRole("button", { name: `Increase ${product.title} quantity` })
      .click();
    await expect(
      page.getByText(formatPrice(expectedTotal), { exact: true }).last(),
    ).toBeVisible();

    await page.getByRole("link", { name: "Proceed to Checkout" }).click();
    await expect(page).toHaveURL("/checkout");
    await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible();
    await expect(page.getByText(product.title)).toBeVisible();

    const checkoutForm = page.getByTestId("checkout-form");
    await checkoutForm.getByLabel("Phone Number").fill("0412 345 678");
    await checkoutForm.getByLabel("Delivery Address").fill("12 Book Lane, Sydney NSW");
    await checkoutForm.getByLabel("Cardholder Name").fill("Cart Customer");
    await checkoutForm.getByLabel("Card Number").fill("1234 5678 9012 3456");
    await checkoutForm.getByLabel("Expiry Date (MM/YY)").fill("12/28");
    await checkoutForm.getByLabel("CVV").fill("123");
    await checkoutForm.getByRole("button", { name: "Place Order" }).click();

    await expect(page).toHaveURL(/\/order-confirmation\?orderId=\d+/);
    await expect(
      page.getByText("Payment Successful! Thank you for your purchase."),
    ).toBeVisible();
    await expect(page.getByText(/TXN-\d{8}-\d{4}/)).toBeVisible();
    await expect(
      page.locator("dl").getByText("Cart Customer", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText(formatPrice(expectedTotal), { exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Book Bag (0)" })).toBeVisible();

    const orders = await client.db.$queryRawUnsafe<
      {
        paymentProvider: string;
        status: string;
        totalAud: number;
        quantity: number;
        title: string;
      }[]
    >(
      `SELECT o."paymentProvider", o."status", o."totalAud", oi."quantity", oi."title"
       FROM "Order" o
       JOIN "OrderItem" oi ON oi."orderId" = o."id"
       ORDER BY o."id" DESC
       LIMIT 1`,
    );
    expect(orders[0]).toEqual({
      paymentProvider: "mock_credit_card",
      status: "PAID",
      totalAud: expectedTotal,
      quantity: checkoutQuantity,
      title: product.title,
    });

    const book = await client.db.post.findUnique({
      where: {
        urlId: product.urlId,
      },
      select: {
        stockQuantity: true,
      },
    });
    expect(book?.stockQuantity).toBe(product.stockQuantity - checkoutQuantity);
  });

  test("signed-in customer can remove an item from the cart", { tag: "@a1" }, async ({ page }) => {
    const product = await getCheckoutProduct();
    const email = uniqueCustomerEmail();
    await registerCustomer(page, email, "password123");

    await page.goto("/", { waitUntil: "domcontentloaded" });
    const card = page.getByTestId(`blog-post-${product.id}`);
    await card
      .getByRole("button", { name: `Flip ${product.title} to details` })
      .click();
    await card.getByRole("button", { name: "Add to Book Bag" }).click();
    await expect(page.getByRole("link", { name: "Book Bag (1)" })).toBeVisible();

    await page.goto("/cart", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Remove" }).click();

    await expect(page.getByText("Your book bag is empty.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Book Bag (0)" })).toBeVisible();
  });

  test("signed-in customer can checkout with pay on delivery", { tag: "@a1" }, async ({ page }) => {
    const product = await getCheckoutProduct();
    const email = uniqueCustomerEmail();
    await registerCustomer(page, email, "password123");

    await page.goto("/", { waitUntil: "domcontentloaded" });
    const card = page.getByTestId(`blog-post-${product.id}`);
    await card
      .getByRole("button", { name: `Flip ${product.title} to details` })
      .click();
    await page.waitForTimeout(800);
    await card.getByRole("button", { name: "Add to Book Bag" }).click();
    await expect(card.getByRole("button", { name: "Added to Book Bag" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Book Bag (1)" })).toBeVisible();

    await page.goto("/checkout", { waitUntil: "domcontentloaded" });
    const checkoutForm = page.getByTestId("checkout-form");
    await expect(page.getByText(product.title)).toBeVisible();
    await checkoutForm.getByLabel("Phone Number").fill("0412 345 678");
    await checkoutForm.getByLabel("Delivery Address").fill("12 Book Lane, Sydney NSW");
    await checkoutForm.getByLabel("Payment Method").selectOption("pay_on_delivery");
    await expect(checkoutForm.getByLabel("Card Number")).not.toBeVisible();
    await checkoutForm.getByRole("button", { name: "Place Order" }).click();

    await expect(page).toHaveURL(/\/order-confirmation\?orderId=\d+/);
    await expect(page.getByText(/TXN-\d{8}-\d{4}/)).toBeVisible();

    const latestOrder = await client.db.order.findFirst({
      where: {
        user: {
          email,
        },
      },
      orderBy: {
        id: "desc",
      },
      include: {
        items: true,
      },
    });
    expect(latestOrder?.paymentProvider).toBe("pay_on_delivery");
    expect(latestOrder?.status).toBe("NOT_PAID");
    expect(latestOrder?.totalAud).toBe(product.priceAud);
    expect(latestOrder?.items[0]?.title).toBe(product.title);
  });

  test("checkout validation does not create an order", { tag: "@a1" }, async ({ request }) => {
    const product = await getCheckoutProduct();

    const email = uniqueCustomerEmail();
    await registerCustomerForApi(request, email, "password123");

    const invalidCardResponse = await request.post("/api/checkout", {
      data: {
        items: [
          {
            id: product.id,
            quantity: 1,
          },
        ],
        customer: {
          fullName: "Invalid Checkout Customer",
          email,
          phone: "0412 345 678",
          deliveryAddress: "12 Book Lane, Sydney NSW",
        },
        payment: {
          method: "mock_credit_card",
          cardholderName: "Invalid Checkout Customer",
          cardNumber: "1234-5678-9012-3456",
          expiryDate: "12/28",
          cvv: "123",
        },
      },
    });
    expect(invalidCardResponse.status()).toBe(400);
    const invalidCardJson = await invalidCardResponse.json();
    expect(invalidCardJson).toEqual({
      error: "Card number can only contain numbers and spaces.",
    });

    const invalidPaymentResponse = await request.post("/api/checkout", {
      data: {
        items: [
          {
            id: product.id,
            quantity: 1,
          },
        ],
        customer: {
          fullName: "Invalid Checkout Customer",
          email,
          phone: "0412 345 678",
          deliveryAddress: "12 Book Lane, Sydney NSW",
        },
        payment: {
          method: "bank_transfer",
        },
      },
    });
    expect(invalidPaymentResponse.status()).toBe(400);
    expect(await invalidPaymentResponse.json()).toEqual({
      error: "Select a valid payment method.",
    });

    const unavailableStockResponse = await request.post("/api/checkout", {
      data: {
        items: [
          {
            id: product.id,
            quantity: product.stockQuantity + 1,
          },
        ],
        customer: {
          fullName: "Invalid Checkout Customer",
          email,
          phone: "0412 345 678",
          deliveryAddress: "12 Book Lane, Sydney NSW",
        },
        payment: {
          method: "pay_on_delivery",
        },
      },
    });
    expect(unavailableStockResponse.status()).toBe(400);
    expect(await unavailableStockResponse.json()).toEqual({
      error: `${product.title} does not have enough stock.`,
    });

    const orders = await client.db.$queryRawUnsafe<{ count: bigint }[]>(
      `SELECT COUNT(*) AS count FROM "Order"`,
    );
    expect(Number(orders[0]?.count ?? 0)).toBe(0);
  });

  test("checkout API requires a customer session", { tag: "@a3" }, async ({ request }) => {
    const product = await getCheckoutProduct();

    const response = await request.post("/api/checkout", {
      data: {
        items: [
          {
            id: product.id,
            quantity: 1,
          },
        ],
        customer: {
          fullName: "Guest Checkout",
          email: "guest@example.com",
          phone: "0412 345 678",
          deliveryAddress: "12 Book Lane, Sydney NSW",
        },
        payment: {
          method: "pay_on_delivery",
        },
      },
    });

    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ error: "Unauthorized" });
  });
});
