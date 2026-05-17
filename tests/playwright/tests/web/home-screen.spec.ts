import { seed } from "@repo/db/seed";
import { expect, test, type Page } from "./fixtures";

test.beforeAll(async () => {
  await seed();
});

test.describe("HOME SCREEN", () => {
  async function checkItem(
    page: Page,
    name: string,
    link: string,
    count?: number,
  ) {
    const linkItem = page.getByTitle(name);
    await expect(linkItem).toBeVisible();
    await expect(linkItem).toHaveAttribute("href", link);

    if (count) {
      const item = linkItem.getByTestId("post-count");
      await expect(item).toBeVisible();
      await expect(item).toContainText(count.toString());
    }
  }

  test(
    "Show Active Posts",
    {
      tag: "@a1",
    },
    async ({ page }) => {
      await page.goto("/");

      await expect(await page.locator("article").count()).toBe(4);
    },
  );

  test(
    "Category Links",
    {
      tag: "@a1",
    },
    async ({ page }) => {
      await page.goto("/");

      // HOME SCREEN > User must see the list of product categories, where each category points to UI showing only products in that category

      await checkItem(page, "Category / Electronics", "/category/electronics", 1);
      await checkItem(page, "Category / Audio", "/category/audio", 1);
      await checkItem(page, "Category / Gaming", "/category/gaming", 1);
      await checkItem(page, "Category / Accessories", "/category/accessories", 1);
    },
  );

  test(
    "History Links",
    {
      tag: "@a1",
    },
    async ({ page }) => {
      await page.goto("/");

      // HOME SCREEN > User must see product arrivals by month and year

      await checkItem(page, "Arrivals / August, 2025", "/history/2025/8", 1);
      await checkItem(page, "Arrivals / December, 2024", "/history/2024/12", 1);
      await checkItem(page, "Arrivals / April, 2022", "/history/2022/4", 1);
      await checkItem(page, "Arrivals / March, 2020", "/history/2020/3", 1);

      // HOME SCREEN > Collections and arrivals shown are only considered from active products

      await expect(page.getByText("December, 2012")).not.toBeVisible();
    },
  );

  test(
    "Tag Links",
    {
      tag: "@a1",
    },
    async ({ page }) => {
      await page.goto("/");

      // HOME SCREEN > User must see the list of product collections, where each collection points to matching products

      await checkItem(page, "Collection / Laptops", "/tags/laptops", 1);
      await checkItem(page, "Collection / Productivity", "/tags/productivity", 1);
      await checkItem(page, "Collection / Headphones", "/tags/headphones", 1);
      await checkItem(page, "Collection / Desk Setup", "/tags/desk-setup", 1);

      // HOME SCREEN > Collections and arrivals shown are only considered from active products

      await expect(page.getByText("Ergonomics")).not.toBeVisible();
    },
  );

  test(
    "Post Item",
    {
      tag: "@a1",
    },
    async ({ page }) => {
      await page.goto("/");

      const item = await page.getByTestId("blog-post-1");
      await expect(item).toBeVisible();

      // HOME SCREEN > The product list shows the following items:
      // - short description
      // - date
      // - image
      // - tags
      // - price
      // - stock

      await expect(item.getByText("AeroBook 14 Pro Laptop")).toBeVisible();
      await expect(
        item.getByText("AeroBook 14 Pro Laptop"),
      ).toHaveAttribute("href", "/post/boost-your-conversion-rate");

      await expect(item.getByText("Electronics")).toBeVisible();
      await expect(item.getByText("#Laptops")).toBeVisible();
      await expect(item.getByText("#Productivity")).toBeVisible();
      await expect(item.getByText("18 Apr 2022")).toBeVisible();
      await expect(item.getByText("$1,299")).toBeVisible();
      await expect(item.getByText("18 in stock")).toBeVisible();
      await expect(
        item.getByRole("button", { name: "Add to Cart" }),
      ).toBeVisible();
    },
  );

  test(
    "Dark Mode Switch",
    {
      tag: "@a1",
    },
    async ({ page }) => {
      await page.goto("/");

      // HOME SCREEN > User must be able to switch between dark and light theme with a button

      const html = await page.getAttribute("html", "data-theme");
      if (html === "dark") {
        await page.getByText("Light Mode").click();
        // await page.waitForTimeout(1000);
        await expect(await page.getAttribute("html", "data-theme")).toBe(
          "light",
        );
      } else {
        await page.getByText("Dark Mode").click();
        // await page.waitForTimeout(1000);
        await expect(await page.getAttribute("html", "data-theme")).toBe(
          "dark",
        );
      }
    },
  );

  test(
    "Search Box",
    {
      tag: "@a1",
    },
    async ({ page }) => {
      await page.goto("/");

      // HOME SCREEN > There is a search functionality that filters products based on string found in title or description

      await page.getByPlaceholder("Search products...").fill("keyboard");
      await expect(page).toHaveURL("/search?q=keyboard");
    },
  );
});
