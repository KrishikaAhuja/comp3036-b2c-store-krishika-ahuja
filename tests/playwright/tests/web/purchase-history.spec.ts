import { client } from "@repo/db/client";
import { seed } from "@repo/db/seed";
import { expect, test, type Page } from "./fixtures";

function uniqueCustomerEmail() {
  return `history-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;
}

async function registerCustomer(page: Page, email: string, password: string) {
  const registerResponse = await page.request.post("/api/auth/register", {
    data: {
      name: "History Customer",
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

test.beforeEach(async () => {
  await seed();
});

test.describe("customer purchase history", () => {
  test("requires customer sign in", { tag: "@a1" }, async ({ page }) => {
    await page.goto("/purchase-history");

    await expect(page).toHaveURL("/auth?next=/purchase-history");
  });

  test("shows paid and not paid customer orders", { tag: "@a1" }, async ({ page }) => {
    const email = uniqueCustomerEmail();
    await registerCustomer(page, email, "password123");

    const customer = await client.db.user.findUniqueOrThrow({
      where: {
        email,
      },
    });
    const product = await client.db.post.findFirstOrThrow({
      where: {
        active: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    await client.db.order.create({
      data: {
        userId: customer.id,
        status: "PAID",
        paymentProvider: "mock_credit_card",
        paymentReference: "TXN-HISTORY-PAID",
        totalAud: product.priceAud,
        items: {
          create: {
            postId: product.id,
            title: product.title,
            urlId: product.urlId,
            imageUrl: product.imageUrl,
            unitPriceAud: product.priceAud,
            quantity: 1,
            lineTotalAud: product.priceAud,
          },
        },
      },
    });

    await client.db.order.create({
      data: {
        userId: customer.id,
        status: "NOT_PAID",
        paymentProvider: "pay_on_delivery",
        paymentReference: "TXN-HISTORY-POD",
        totalAud: product.priceAud * 2,
        items: {
          create: {
            postId: product.id,
            title: product.title,
            urlId: product.urlId,
            imageUrl: product.imageUrl,
            unitPriceAud: product.priceAud,
            quantity: 2,
            lineTotalAud: product.priceAud * 2,
          },
        },
      },
    });

    await page.goto("/purchase-history");

    await expect(
      page.getByRole("heading", { name: "Purchase History" }),
    ).toBeVisible();
    await expect(page.getByText("Paid", { exact: true })).toBeVisible();
    await expect(page.getByText("Not paid", { exact: true })).toBeVisible();
    await expect(page.getByText(product.title).first()).toBeVisible();
    await expect(page.getByText("Qty 2").first()).toBeVisible();
  });
});
