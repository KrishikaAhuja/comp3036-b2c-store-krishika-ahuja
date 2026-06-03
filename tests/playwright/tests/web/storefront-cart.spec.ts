import { client } from "@repo/db/client";
import { seed } from "@repo/db/seed";
import { expect, test } from "./fixtures";

function uniqueCustomerEmail() {
  return `cart-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;
}

test.beforeEach(async () => {
  await seed();
});

test.describe("customer book bag", () => {
  test("unauthenticated add redirects to customer sign in", { tag: "@a1" }, async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const card = page.getByTestId("blog-post-5");
    await card.getByRole("button", { name: "Flip Atomic Habits to details" }).click();
    await card.getByRole("button", { name: "Add to Book Bag" }).click();
    await expect(page).toHaveURL("/auth?next=%2F");
  });

  test("signed-in customer can checkout with mock payment", { tag: "@a1" }, async ({ page }) => {
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
    const card = page.getByTestId("blog-post-5");
    await card.getByRole("button", { name: "Flip Atomic Habits to details" }).click();
    await card.getByRole("button", { name: "Add to Book Bag" }).click();
    await expect(card.getByRole("button", { name: "Added to Book Bag" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Book Bag (1)" })).toBeVisible();

    await page.goto("/cart", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Book Bag" })).toBeVisible();
    await expect(page.getByText("Atomic Habits")).toBeVisible();
    await expect(page.getByText("$28", { exact: true }).last()).toBeVisible();

    await page.getByRole("button", { name: "Increase Atomic Habits quantity" }).click();
    await expect(page.getByText("$56", { exact: true }).last()).toBeVisible();

    await page.getByRole("link", { name: "Proceed to Checkout" }).click();
    await expect(page).toHaveURL("/checkout");
    await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible();
    await expect(page.getByText("Atomic Habits")).toBeVisible();

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
    await expect(page.getByText(/MOCK-\d{8}-\d{4}/)).toBeVisible();
    await expect(page.locator("dl").getByText("Cart Customer", { exact: true })).toBeVisible();
    await expect(page.getByText("$56", { exact: true })).toBeVisible();
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
      totalAud: 56,
      quantity: 2,
      title: "Atomic Habits",
    });

    const book = await client.db.post.findUnique({
      where: {
        urlId: "atomic-habits",
      },
      select: {
        stockQuantity: true,
      },
    });
    expect(book?.stockQuantity).toBe(33);
  });

  test("checkout validation does not create an order or clear the cart", { tag: "@a1" }, async ({ page }) => {
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
    await page.evaluate(() => {
      window.localStorage.setItem(
        "storefront-cart",
        JSON.stringify([
          {
            id: 5,
            urlId: "atomic-habits",
            title: "Atomic Habits",
            price: 28,
            imageUrl:
              "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1655988385i/40121378.jpg",
            stockQuantity: 35,
            quantity: 1,
          },
        ]),
      );
    });

    await page.goto("/checkout", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL("/checkout");
    await expect(page.getByRole("link", { name: "Book Bag (1)" })).toBeVisible();

    const invalidCardResponse = await page.request.post("/api/checkout", {
      data: {
        items: [
          {
            id: 5,
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
