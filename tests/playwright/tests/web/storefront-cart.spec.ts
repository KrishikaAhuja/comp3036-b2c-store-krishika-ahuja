import { client } from "@repo/db/client";
import { seed } from "@repo/db/seed";
import { expect, test } from "./fixtures";

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
    await card.getByRole("button", { name: "Add to Book Bag" }).click();
    await expect(page).toHaveURL("/auth?next=%2F");
  });

  test("signed-in customer can checkout with card payment", { tag: "@a1" }, async ({ page }) => {
    const product = await getCheckoutProduct();
    const checkoutQuantity = 2;
    const expectedTotal = product.priceAud * checkoutQuantity;

    const email = uniqueCustomerEmail();
    const registerResponse = await page.request.post("/api/auth/register", {
      data: {
        name: "Cart Customer",
        email,
        password: "password123",
      },
    });
    expect(registerResponse.status()).toBe(201);
    const loginResponse = await page.request.post("/api/auth/login", {
      data: {
        email,
        password: "password123",
      },
    });
    expect(loginResponse.status()).toBe(200);

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
      { totalAud: number; quantity: number; title: string }[]
    >(
      `SELECT o."totalAud", oi."quantity", oi."title"
       FROM "Order" o
       JOIN "OrderItem" oi ON oi."orderId" = o."id"
       ORDER BY o."id" DESC
       LIMIT 1`,
    );
    expect(orders[0]).toEqual({
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

  test("checkout validation does not create an order or clear the cart", { tag: "@a1" }, async ({ page }) => {
    const product = await getCheckoutProduct();

    const email = uniqueCustomerEmail();
    const registerResponse = await page.request.post("/api/auth/register", {
      data: {
        name: "Invalid Checkout Customer",
        email,
        password: "password123",
      },
    });
    expect(registerResponse.status()).toBe(201);
    const loginResponse = await page.request.post("/api/auth/login", {
      data: {
        email,
        password: "password123",
      },
    });
    expect(loginResponse.status()).toBe(200);

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.evaluate((cartProduct) => {
      window.localStorage.setItem(
        "storefront-cart",
        JSON.stringify([
          {
            id: cartProduct.id,
            urlId: cartProduct.urlId,
            title: cartProduct.title,
            price: cartProduct.priceAud,
            imageUrl: cartProduct.imageUrl,
            stockQuantity: cartProduct.stockQuantity,
            quantity: 1,
          },
        ]),
      );
    }, product);

    await page.goto("/checkout", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL("/checkout");
    await expect(page.getByRole("link", { name: "Book Bag (1)" })).toBeVisible();

    const invalidCardResponse = await page.request.post("/api/checkout", {
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
    expect(await invalidCardResponse.json()).toEqual({
      error: "Card number can only contain numbers and spaces.",
    });

    const orders = await client.db.$queryRawUnsafe<{ count: number }[]>(
      `SELECT COUNT(*) AS count FROM "Order"`,
    );
    expect(orders[0]?.count).toBe(0);
  });
});
