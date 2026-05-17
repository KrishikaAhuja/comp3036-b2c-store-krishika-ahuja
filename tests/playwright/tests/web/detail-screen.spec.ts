import { seed } from "@repo/db/seed";
import { expect, test } from "./fixtures";

test.describe("DETAIL SCREEN", () => {
  test.beforeEach(async () => {
    await seed();
  });

  test(
    "Detail view",
    {
      tag: "@a1",
    },
    async ({ page }) => {
      await page.goto("/post/boost-your-conversion-rate");

      // DETAIL SCREEN > Detail page shows the same product as list item, but the short description is replaced by formatted long description

      const item = await page.getByTestId("blog-post-1");
      await expect(item).toBeVisible();

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
      await expect(item.getByText("685 customer views")).toBeVisible();
      await expect(item.getByText("73 watching stock")).toBeVisible();

      // DETAIL SCREEN > Detail text is stored as Markdown, which needs to be converted to HTML
      await expect(
        await page.getByTestId("content-markdown").innerHTML(),
      ).toContain("<h2>Key features</h2>");
    },
  );

  test(
    "Views increase on each view",
    {
      tag: "@a3",
    },
    async ({ page }) => {
      // BACKEND / CLIENT > Each visit of the page increases the product views count by one

      await page.goto("/post/boost-your-conversion-rate");
      await expect(page.getByText("Product views: 685")).toBeVisible();
      await page.goto("/post/boost-your-conversion-rate");
      await expect(page.getByText("Product views: 686")).toBeVisible();
    },
  );

  test(
    "Like posts",
    {
      tag: "@a3",
    },
    async ({ page }) => {
      // BACKEND / CLIENT > User can watch stock on the detail screen, NOT on the list

      await page.goto("/post/boost-your-conversion-rate");
      await expect(page.getByText("Stock watchers: 73")).toBeVisible();
      await page.getByTestId("like-button").click();
      await expect(page.getByText("Stock watchers: 74")).toBeVisible();

      await page.goto("/post/boost-your-conversion-rate");
      await expect(page.getByText("Stock watchers: 74")).toBeVisible();
      await page.getByTestId("like-button").click();
      await expect(page.getByText("Stock watchers: 73")).toBeVisible();
    },
  );
});
