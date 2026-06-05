import { client } from "@repo/db/client";
import { seed } from "@repo/db/seed";
import { expect, test, type Locator, type Page } from "./fixtures";

const webUrl = process.env.E2E_WEB_URL ?? "http://localhost:3001";

function uniqueEmail() {
  return `customer-coverage-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;
}

async function signInCustomer(page: Page, name = "Coverage Customer") {
  const email = uniqueEmail();
  const password = "password123";

  await page.request.post("/api/auth/register", {
    data: {
      name,
      email,
      password,
    },
  });
  const loginResponse = await page.request.post("/api/auth/login", {
    data: {
      email,
      password,
    },
  });
  const authCookie = loginResponse
    .headers()["set-cookie"]
    ?.match(/customer_auth_token=([^;]+)/)?.[1];

  expect(authCookie).toBeTruthy();

  await page.context().addCookies([
    {
      name: "customer_auth_token",
      value: authCookie!,
      url: webUrl,
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);

  return { email, name };
}

async function setCart(page: Page, quantity = 1) {
  const product = await client.db.post.findFirstOrThrow({
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

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate(
    ({ cartProduct, cartQuantity }) => {
      window.localStorage.setItem(
        "storefront-cart",
        JSON.stringify([{ ...cartProduct, quantity: cartQuantity }]),
      );
      window.dispatchEvent(new Event("storefront-cart-updated"));
    },
    {
      cartProduct: {
        id: product.id,
        urlId: product.urlId,
        title: product.title,
        price: product.priceAud,
        imageUrl: product.imageUrl,
        stockQuantity: product.stockQuantity,
      },
      cartQuantity: quantity,
    },
  );

  return product;
}

async function fillValidCheckoutForm(form: Locator) {
  await form.getByLabel("Phone Number").fill("0412 345 678");
  await form.getByLabel("House or Building Number").fill("12");
  await form.getByLabel("Street Name").fill("Book Lane");
  await form.getByLabel("Suburb or Area").fill("Sydney");
  await form.getByLabel("State").fill("NSW");
  await form.getByLabel("Postcode").fill("2000");
}

test.beforeEach(async ({ context }) => {
  await seed();
  await context.clearCookies();
});

test.describe("customer feature coverage", () => {
  test("signed-in header shows account icon name and history link", { tag: "@a1" }, async ({
    page,
  }) => {
    await signInCustomer(page, "Header Customer");

    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(page.getByLabel("Signed in as Header Customer")).toBeVisible();
    await expect(page.getByRole("link", { name: "Purchase History" })).toBeVisible();
  });

  test("signed-in header hides the sign in link", { tag: "@a1" }, async ({ page }) => {
    await signInCustomer(page);

    await page.goto("/");

    await expect(page.getByRole("link", { name: "Sign in" })).not.toBeVisible();
    await expect(page.getByRole("button", { name: "Logout" })).toBeVisible();
  });

  test("signed-in customer can open purchase history from the header", { tag: "@a1" }, async ({
    page,
  }) => {
    await signInCustomer(page);

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.getByRole("link", { name: "Purchase History" }).click();

    await expect(page).toHaveURL("/purchase-history");
    await expect(page.getByRole("heading", { name: "Purchase History" })).toBeVisible();
  });

  test("empty cart links customers back to browsing", { tag: "@a1" }, async ({ page }) => {
    await signInCustomer(page);

    await page.goto("/cart");

    await expect(page.getByText("Your book bag is empty.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Browse Books" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  test("cart shows line subtotal and checkout action", { tag: "@a1" }, async ({ page }) => {
    await signInCustomer(page);
    const product = await setCart(page, 2);

    await page.goto("/cart");

    await expect(page.getByText(product.title)).toBeVisible();
    await expect(page.getByText("$" + product.priceAud * 2, { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Proceed to Checkout" })).toHaveAttribute(
      "href",
      "/checkout",
    );
  });

  test("cart decrease removes a single-quantity item", { tag: "@a1" }, async ({ page }) => {
    await signInCustomer(page);
    const product = await setCart(page, 1);

    await page.goto("/cart");
    await page.getByRole("button", { name: `Decrease ${product.title} quantity` }).click();

    await expect(page.getByText("Your book bag is empty.")).toBeVisible();
  });

  test("cart increase updates the book bag counter", { tag: "@a1" }, async ({ page }) => {
    await signInCustomer(page);
    const product = await setCart(page, 1);

    await page.goto("/cart");
    await page.getByRole("button", { name: `Increase ${product.title} quantity` }).click();

    await expect(page.getByRole("link", { name: "Book Bag (2)" })).toBeVisible();
  });

  test("checkout rejects an invalid phone number", { tag: "@a1" }, async ({ page }) => {
    await signInCustomer(page);
    await setCart(page);

    await page.goto("/checkout");
    const form = page.getByTestId("checkout-form");
    await fillValidCheckoutForm(form);
    await form.getByLabel("Phone Number").fill("12345");
    await form.getByRole("button", { name: "Place Order" }).click();

    await expect(page.getByText("Enter any 10 digits")).toBeVisible();
  });

  test("checkout requires a house or building number", { tag: "@a1" }, async ({ page }) => {
    await signInCustomer(page);
    await setCart(page);

    await page.goto("/checkout");
    const form = page.getByTestId("checkout-form");
    await fillValidCheckoutForm(form);
    await form.getByLabel("House or Building Number").fill("");
    await form.getByRole("button", { name: "Place Order" }).click();

    await expect(
      form
        .locator("label")
        .filter({ hasText: "House or Building Number" })
        .getByText("Required"),
    ).toBeVisible();
  });

  test("checkout accepts mixed house or building numbers", { tag: "@a1" }, async ({
    page,
  }) => {
    await signInCustomer(page);
    await setCart(page);

    await page.goto("/checkout");
    const form = page.getByTestId("checkout-form");
    await fillValidCheckoutForm(form);
    await form.getByLabel("House or Building Number").fill("12A!");
    await form.getByLabel("Payment Method").selectOption("pay_on_delivery");
    await form.getByRole("button", { name: "Place Order" }).click();

    await expect(page).toHaveURL(/\/order-confirmation\?orderId=\d+/);
  });

  test("checkout requires a street name", { tag: "@a1" }, async ({ page }) => {
    await signInCustomer(page);
    await setCart(page);

    await page.goto("/checkout");
    const form = page.getByTestId("checkout-form");
    await fillValidCheckoutForm(form);
    await form.getByLabel("Street Name").fill("");
    await form.getByRole("button", { name: "Place Order" }).click();

    await expect(
      form.locator("label").filter({ hasText: "Street Name" }).getByText("Required"),
    ).toBeVisible();
  });

  test("checkout requires a suburb or area", { tag: "@a1" }, async ({ page }) => {
    await signInCustomer(page);
    await setCart(page);

    await page.goto("/checkout");
    const form = page.getByTestId("checkout-form");
    await fillValidCheckoutForm(form);
    await form.getByLabel("Suburb or Area").fill("");
    await form.getByRole("button", { name: "Place Order" }).click();

    await expect(
      form.locator("label").filter({ hasText: "Suburb or Area" }).getByText("Required"),
    ).toBeVisible();
  });

  test("checkout requires a state", { tag: "@a1" }, async ({ page }) => {
    await signInCustomer(page);
    await setCart(page);

    await page.goto("/checkout");
    const form = page.getByTestId("checkout-form");
    await fillValidCheckoutForm(form);
    await form.getByLabel("State").fill("");
    await form.getByRole("button", { name: "Place Order" }).click();

    await expect(
      form.locator("label").filter({ hasText: "State" }).getByText("Required"),
    ).toBeVisible();
  });

  test("checkout requires a postcode", { tag: "@a1" }, async ({ page }) => {
    await signInCustomer(page);
    await setCart(page);

    await page.goto("/checkout");
    const form = page.getByTestId("checkout-form");
    await fillValidCheckoutForm(form);
    await form.getByLabel("Postcode").fill("");
    await form.getByRole("button", { name: "Place Order" }).click();

    await expect(
      form.locator("label").filter({ hasText: "Postcode" }).getByText("Required"),
    ).toBeVisible();
  });

  test("checkout offers card and pay on delivery methods", { tag: "@a1" }, async ({ page }) => {
    await signInCustomer(page);
    await setCart(page);

    await page.goto("/checkout");
    const form = page.getByTestId("checkout-form");
    const paymentMethod = form.locator('select[name="paymentMethod"]');

    await expect(paymentMethod.locator("option")).toHaveText([
      "Credit Card",
      "Pay on Delivery",
    ]);
  });

  test("card payment keeps card inputs visible", { tag: "@a1" }, async ({ page }) => {
    await signInCustomer(page);
    await setCart(page);

    await page.goto("/checkout");
    const form = page.getByTestId("checkout-form");

    await expect(form.getByLabel("Cardholder Name")).toBeVisible();
    await expect(form.getByLabel("Card Number")).toBeVisible();
  });
});
