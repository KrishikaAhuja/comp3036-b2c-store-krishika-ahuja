import { expect, test } from "./fixtures";

test.describe("SEARCH SCREEN", () => {
  test(
    "Existing search result",
    {
      tag: "@a1",
    },
    async ({ page }) => {
      await page.goto("/search?q=headphones");

      // SEARCH SCREEN > Displays results based on search string stored in the query string (e.g. /search?q=headphones)

      // console.log(await page.innerHTML("body"));

      const articles = await page.locator('[data-test-id^="blog-post-"]');
      await expect(articles).toHaveCount(1);

      await expect(page.getByTestId("blog-post-2")).toBeVisible();
      await expect(
        page.getByText("PulseWave Noise-Cancelling Headphones"),
      ).toBeVisible();
    },
  );

  test(
    "Search finds multiple posts",
    {
      tag: "@a1",
    },
    async ({ page }) => {
      await page.goto("/search?q=desk");

      // SEARCH SCREEN > Displays results based on search string stored in the query string (e.g. /search?q=desk)

      const articles = await page.locator('[data-test-id^="blog-post-"]');
      await expect(articles).toHaveCount(2);

      await expect(page.getByTestId("blog-post-1")).toBeVisible();
      await expect(
        page.getByText("AeroBook 14 Pro Laptop"),
      ).toBeVisible();

      await expect(page.getByTestId("blog-post-5")).toBeVisible();
      await expect(
        page.getByText("MagDock 3-in-1 Charging Station"),
      ).toBeVisible();
    },
  );

  test(
    "Invalid Search",
    {
      tag: "@a1",
    },
    async ({ page }) => {
      await page.goto("/search?q=abc");

      // SEARCH SCREEN > Displays "0 Products" when search does not find anything

      const articles = await page.locator('[data-test-id^="blog-post-"]');
      await expect(articles).toHaveCount(0);

      await expect(page.getByText("0 Products")).toBeVisible();
    },
  );
});
