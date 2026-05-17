import { expect, test } from "./fixtures";

test.describe("STOREFRONT", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test("product catalog page loads", { tag: "@a1" }, async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("AeroBook 14 Pro Laptop")).toBeVisible();
    await expect(page.locator('[data-test-id^="blog-post-"]')).toHaveCount(4);
    await expect(page.getByRole("link", { name: "Cart (0)" })).toBeVisible();
  });

  test(
    "product cards show product details and cart action",
    { tag: "@a1" },
    async ({ page }) => {
      await page.goto("/");

      const productCard = page.getByTestId("blog-post-1");
      await expect(productCard).toBeVisible();
      await expect(productCard.getByText("AeroBook 14 Pro Laptop")).toBeVisible();
      await expect(productCard.getByText("$1,299")).toBeVisible();
      await expect(productCard.getByText("Electronics")).toBeVisible();
      await expect(productCard.getByText("18 in stock")).toBeVisible();
      await expect(
        productCard.getByRole("button", { name: "Add to Cart" }),
      ).toBeVisible();
      await expect(
        productCard.getByRole("link", { name: "View Product" }),
      ).toBeVisible();
    },
  );

  test("category filtering works", { tag: "@a1" }, async ({ page }) => {
    await page.goto("/");

    await page.getByTitle("Category / Audio").click();

    await expect(page).toHaveURL("/category/audio");
    await expect(page.locator('[data-test-id^="blog-post-"]')).toHaveCount(1);
    await expect(
      page.getByText("PulseWave Noise-Cancelling Headphones"),
    ).toBeVisible();
    await expect(page.getByText("AeroBook 14 Pro Laptop")).not.toBeVisible();
  });

  test("search works", { tag: "@a1" }, async ({ page }) => {
    await page.goto("/");

    await page.getByPlaceholder("Search products...").fill("keyboard");

    await expect(page).toHaveURL("/search?q=keyboard");
    await expect(page.locator('[data-test-id^="blog-post-"]')).toHaveCount(1);
    await expect(page.getByText("Vertex RGB Mechanical Keyboard")).toBeVisible();
    await expect(
      page.getByText("PulseWave Noise-Cancelling Headphones"),
    ).not.toBeVisible();
  });

  test(
    "adding to cart increases navbar cart count",
    { tag: "@a1" },
    async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("link", { name: "Cart (0)" })).toBeVisible();
    await page
      .getByTestId("blog-post-1")
      .getByRole("button", { name: "Add to Cart" })
      .click();

    await expect(page.getByRole("link", { name: "Cart (1)" })).toBeVisible();
    },
  );

  test(
    "cart page shows added product, quantity controls and total",
    { tag: "@a1" },
    async ({ page }) => {
      await page.goto("/");
      await page
        .getByTestId("blog-post-1")
        .getByRole("button", { name: "Add to Cart" })
        .click();
      await page.getByRole("link", { name: "Cart (1)" }).click();

      await expect(page).toHaveURL("/cart");
      await expect(page.getByText("AeroBook 14 Pro Laptop")).toBeVisible();
      await expect(page.getByText("$1,299").first()).toBeVisible();
      await expect(page.getByText("Total")).toBeVisible();
      await expect(page.getByText("$1,299").last()).toBeVisible();
      await expect(
        page.getByRole("button", {
          name: "Decrease AeroBook 14 Pro Laptop quantity",
        }),
      ).toBeVisible();
      await expect(
        page.getByRole("button", {
          name: "Increase AeroBook 14 Pro Laptop quantity",
        }),
      ).toBeVisible();

      await page
        .getByRole("button", {
          name: "Increase AeroBook 14 Pro Laptop quantity",
        })
        .click();

      await expect(page.getByRole("link", { name: "Cart (2)" })).toBeVisible();
      await expect(page.getByText("$2,598")).toBeVisible();
    },
  );

  test("removing an item empties the cart", { tag: "@a1" }, async ({ page }) => {
    await page.goto("/");
    await page
      .getByTestId("blog-post-1")
      .getByRole("button", { name: "Add to Cart" })
      .click();
    await page.goto("/cart");

    await page.getByRole("button", { name: "Remove" }).click();

    await expect(page.getByText("Your cart is empty.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Cart (0)" })).toBeVisible();
  });
});
