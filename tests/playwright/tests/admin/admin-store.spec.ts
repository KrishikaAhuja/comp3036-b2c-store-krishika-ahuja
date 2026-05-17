import { seed } from "@repo/db/seed";
import { expect, test } from "./fixtures";

async function openFilters(page: any) {
  await page.getByRole("button", { name: "All Filters" }).click();
}

async function productPrices(page: any) {
  const cards = await page.locator("article").allTextContents();
  return cards.map((text: string) => {
    const match = text.match(/\$(\d[\d,]*)/);
    return match ? Number(match[1].replaceAll(",", "")) : 0;
  });
}

async function firstProductDate(page: any) {
  const text = await page.locator("article").first().innerText();
  const match = text.match(/Added on ([A-Z][a-z]{2} \d{1,2}, \d{4})/);
  return match?.[1] ?? "";
}

test.beforeEach(async () => {
  await seed();
});

test.describe("ADMINSTORE", () => {
  test(
    "product management page loads",
    { tag: "@a2" },
    async ({ userPage }) => {
      await userPage.goto("/");

      await expect(userPage.getByRole("heading", { name: "Product Management" })).toBeVisible();
      await expect(userPage.getByRole("link", { name: "Create Product" })).toBeVisible();
      await expect(userPage.getByRole("button", { name: "All Filters" })).toBeVisible();

      await expect(userPage.locator("article")).toHaveCount(5);
      const product = userPage
        .locator("article")
        .filter({ hasText: "GlidePro Wireless Mouse" });
      await expect(product).toHaveCount(1);
      await expect(product.getByText("$59")).toBeVisible();
      await expect(product.getByText("Category: Accessories")).toBeVisible();
      await expect(product.getByText("Stock: 64")).toBeVisible();
      await expect(product.getByText("In stock")).toBeVisible();
      await expect(product.getByRole("link", { name: "Edit" })).toBeVisible();
      await expect(product.getByRole("button", { name: "Delete" })).toBeVisible();
    },
  );

  test("filter drawer opens", { tag: "@a2" }, async ({ userPage }) => {
    await userPage.goto("/");
    await openFilters(userPage);

    await expect(userPage.getByRole("heading", { name: "Filters" })).toBeVisible();
    await expect(userPage.getByRole("button", { name: "Close filters" })).toBeVisible();
    await expect(userPage.getByLabel("Search product")).toBeVisible();
    await expect(userPage.getByLabel("Collection")).toBeVisible();
    await expect(userPage.getByLabel("Category")).toBeVisible();
    await expect(userPage.getByLabel("Date added")).toBeVisible();
    await expect(userPage.getByLabel("Stock status")).toBeVisible();
    await expect(userPage.getByLabel("Sort by")).toBeVisible();
  });

  test("filter drawer closes", { tag: "@a2" }, async ({ userPage }) => {
    await userPage.goto("/");
    await openFilters(userPage);

    await userPage.getByRole("button", { name: "Close filters" }).click();

    await expect(userPage.getByRole("heading", { name: "Filters" })).not.toBeVisible();
  });

  test("product search filter works", { tag: "@a2" }, async ({ userPage }) => {
    await userPage.goto("/");
    await openFilters(userPage);

    await userPage.getByLabel("Search product").fill("Vertex");

    await expect(userPage.locator("article")).toHaveCount(1);
    await expect(userPage.getByText("Vertex RGB Mechanical Keyboard")).toBeVisible();
    await expect(userPage.getByText("AeroBook 14 Pro Laptop")).not.toBeVisible();
  });

  test("collection filter works", { tag: "@a2" }, async ({ userPage }) => {
    await userPage.goto("/");
    await openFilters(userPage);

    await userPage.getByLabel("Collection").fill("Wireless");

    await expect(userPage.locator("article")).toHaveCount(2);
    await expect(userPage.getByText("PulseWave Noise-Cancelling Headphones")).toBeVisible();
    await expect(userPage.getByText("GlidePro Wireless Mouse")).toBeVisible();
  });

  test("category filter works", { tag: "@a2" }, async ({ userPage }) => {
    await userPage.goto("/");
    await openFilters(userPage);

    await userPage.getByLabel("Category").selectOption("Accessories");

    await expect(userPage.locator("article")).toHaveCount(2);
    await expect(userPage.getByText("MagDock 3-in-1 Charging Station")).toBeVisible();
    await expect(userPage.getByText("GlidePro Wireless Mouse")).toBeVisible();
    await expect(userPage.getByText("AeroBook 14 Pro Laptop")).not.toBeVisible();
  });

  test("stock status filter works", { tag: "@a2" }, async ({ userPage }) => {
    await userPage.goto("/");
    await openFilters(userPage);

    await userPage.getByLabel("Stock status").selectOption("in-stock");
    await expect(userPage.locator("article")).toHaveCount(5);

    await userPage.getByLabel("Stock status").selectOption("out-of-stock");
    await expect(userPage.locator("article")).toHaveCount(0);
    await expect(userPage.getByText("No products matched your filters.")).toBeVisible();
  });

  test("price sorting works", { tag: "@a2" }, async ({ userPage }) => {
    await userPage.goto("/");
    await openFilters(userPage);

    await userPage.getByLabel("Sort by").selectOption("price-asc");
    let prices = await productPrices(userPage);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));

    await userPage.getByLabel("Sort by").selectOption("price-desc");
    prices = await productPrices(userPage);
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  test("date sorting works", { tag: "@a2" }, async ({ userPage }) => {
    await userPage.goto("/");
    await openFilters(userPage);

    await userPage.getByLabel("Sort by").selectOption("date-desc");
    await expect(userPage.locator("article").first()).toContainText(
      "MagDock 3-in-1 Charging Station",
    );

    await userPage.getByLabel("Sort by").selectOption("date-asc");
    expect(await firstProductDate(userPage)).toBe("Dec 16, 2012");
  });

  test("price and stock validation works", { tag: "@a2" }, async ({ userPage }) => {
    await userPage.goto("/posts/create");

    await userPage.getByLabel("Product Name").fill("Validation product");
    await userPage.getByLabel("Category").fill("Accessories");
    await userPage.getByLabel("Description").fill("A test product");
    await userPage.getByLabel("Product Details").fill("Detailed product copy");
    await userPage.getByLabel("Collections").fill("Testing");
    await userPage.getByLabel("Image URL").fill("http://example.com/image.jpg");

    await userPage.getByLabel("Price").fill("-1");
    await userPage.getByLabel("Stock Quantity").fill("1.5");
    await userPage.getByRole("button", { name: "Save" }).click();

    await expect(userPage.getByText("Price must be 0 or more")).toBeVisible();
    await expect(
      userPage.getByText("Stock must be a whole number 0 or more"),
    ).toBeVisible();
  });

  test(
    "create product form has store fields",
    { tag: "@a2" },
    async ({ userPage }) => {
      await userPage.goto("/posts/create");

      await expect(userPage.getByRole("heading", { name: "Create Product" })).toBeVisible();
      await expect(userPage.getByLabel("Product Name")).toBeVisible();
      await expect(userPage.getByLabel("Description")).toBeVisible();
      await expect(userPage.getByLabel("Category")).toBeVisible();
      await expect(userPage.getByLabel("Image URL")).toBeVisible();
      await expect(userPage.getByLabel("Price")).toBeVisible();
      await expect(userPage.getByLabel("Stock Quantity")).toBeVisible();
      await expect(userPage.getByLabel("Active in store")).toBeVisible();
    },
  );

  test(
    "edit product form has store fields",
    { tag: "@a2" },
    async ({ userPage }) => {
      await userPage.goto("/post/no-front-end-framework-is-the-best");

      await expect(userPage.getByRole("heading", { name: "Update Product" })).toBeVisible();
      await expect(userPage.getByLabel("Product Name")).toBeVisible();
      await expect(userPage.getByLabel("Description")).toBeVisible();
      await expect(userPage.getByLabel("Category")).toBeVisible();
      await expect(userPage.getByLabel("Image URL")).toBeVisible();
      await expect(userPage.getByLabel("Price")).toBeVisible();
      await expect(userPage.getByLabel("Stock Quantity")).toBeVisible();
      await expect(userPage.getByLabel("Active in store")).toBeVisible();
    },
  );

  test("delete product removes it from list", { tag: "@a2" }, async ({ userPage }) => {
    await userPage.goto("/");

    const product = userPage
      .locator("article")
      .filter({ hasText: "MagDock 3-in-1 Charging Station" });
    await expect(product).toHaveCount(1);

    await product.getByRole("button", { name: "Delete" }).click();

    await expect(
      userPage.getByText("MagDock 3-in-1 Charging Station"),
    ).not.toBeVisible();
    await expect(userPage.locator("article")).toHaveCount(4);
  });
});
