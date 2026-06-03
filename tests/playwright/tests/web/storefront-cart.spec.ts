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

    await page.getByRole("button", { name: "Pay with Mock Checkout" }).click();
    await expect(page.getByText(/Payment approved\. Order #/)).toBeVisible();
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
});
