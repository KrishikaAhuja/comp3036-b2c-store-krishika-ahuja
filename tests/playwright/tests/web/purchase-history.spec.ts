import { client } from "@repo/db/client";
import { seed } from "@repo/db/seed";
import { expect, test, type Browser, type Page } from "./fixtures";

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

  test("signed-in customers can navigate from the header", { tag: "@a1" }, async ({ page }) => {
    const email = uniqueCustomerEmail();
    await registerCustomer(page, email, "password123");

    await page.goto("/");
    await page.getByRole("link", { name: "Purchase History" }).click();

    await expect(page).toHaveURL("/purchase-history");
    await expect(
      page.getByRole("heading", { name: "Purchase History" }),
    ).toBeVisible();
  });

  test("checkout order appears in customer history and admin orders", { tag: "@a3" }, async ({
    browser,
    page,
  }: {
    browser: Browser;
    page: Page;
  }) => {
    const product = await client.db.post.findFirstOrThrow({
      where: {
        active: true,
        stockQuantity: {
          gte: 1,
        },
      },
      orderBy: {
        id: "asc",
      },
    });
    const email = uniqueCustomerEmail();
    await registerCustomer(page, email, "password123");

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.evaluate((cartProduct) => {
      window.localStorage.setItem(
        "storefront-cart",
        JSON.stringify([{ ...cartProduct, quantity: 1 }]),
      );
      window.dispatchEvent(new Event("storefront-cart-updated"));
    }, {
      id: product.id,
      urlId: product.urlId,
      title: product.title,
      price: product.priceAud,
      imageUrl: product.imageUrl,
      stockQuantity: product.stockQuantity,
    });
    await expect(page.getByRole("link", { name: "Book Bag (1)" })).toBeVisible();

    await page.goto("/checkout", { waitUntil: "domcontentloaded" });
    const checkoutForm = page.getByTestId("checkout-form");
    await expect(page.getByText(product.title)).toBeVisible();
    await checkoutForm.getByLabel("Phone Number").fill("0412 345 678");
    await checkoutForm.getByLabel("Delivery Address").fill("12 Book Lane, Sydney NSW");
    await checkoutForm.getByLabel("Payment Method").selectOption("pay_on_delivery");
    await checkoutForm.getByRole("button", { name: "Place Order" }).click();

    await expect(page).toHaveURL(/\/order-confirmation\?orderId=\d+/);
    await expect(
      page.locator("dl").getByText("Not paid", { exact: true }),
    ).toBeVisible();
    const orderId = Number(new URL(page.url()).searchParams.get("orderId"));

    await page.goto("/purchase-history");
    const historyOrder = page.locator("article", { hasText: `Order #${orderId}` });
    await expect(historyOrder).toContainText("Not paid");
    await expect(historyOrder).toContainText(product.title);
    await expect(historyOrder).toContainText("Qty 1");

    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    try {
      await adminPage.goto("http://localhost:3002/");
      await adminPage.getByLabel("Email", { exact: true }).fill("admin@example.com");
      await adminPage.getByLabel("Password", { exact: true }).fill("123");
      await adminPage.getByText("Sign In", { exact: true }).click();
      await adminPage.getByText("Admin Dashboard", { exact: true }).waitFor();
      await adminPage.goto("http://localhost:3002/orders");

      const adminOrder = adminPage.getByRole("row", {
        name: new RegExp(`#${orderId}`),
      });
      await expect(adminOrder).toContainText(email);
      await expect(adminOrder).toContainText("Not paid");
    } finally {
      await adminContext.close();
    }
  });
});
