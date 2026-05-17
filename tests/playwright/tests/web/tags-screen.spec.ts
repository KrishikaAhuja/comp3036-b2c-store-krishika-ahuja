import { expect, test } from "./fixtures";

test.describe("TAG SCREEN", () => {
  test(
    "Existing Tag with one post",
    {
      tag: "@a1",
    },
    async ({ page }) => {
      await page.goto("/tags/rgb");

      // TAG SCREEN > Displays products with the collection url (e.g. /tags/rgb)

      const articles = await page.locator('[data-test-id^="blog-post-"]');
      await expect(articles).toHaveCount(1);

      await expect(page.getByTestId("blog-post-3")).toBeVisible();
      await expect(
        page.getByText("Vertex RGB Mechanical Keyboard"),
      ).toBeVisible();
    },
  );

  test(
    "Existing Tag with multiple posts",
    {
      tag: "@a1",
    },
    async ({ page }) => {
      await page.goto("/tags/desk-setup");

      const articles = await page.locator('[data-test-id^="blog-post-"]');
      await expect(articles).toHaveCount(1);

      await expect(page.getByTestId("blog-post-5")).toBeVisible();
      await expect(
        page.getByText("MagDock 3-in-1 Charging Station"),
      ).toBeVisible();
    },
  );

  test(
    "Invalid Tag",
    {
      tag: "@a1",
    },
    async ({ page }) => {
      await page.goto("/tags/abc");

      // TAG SCREEN > Displays "0 Products" when no products have that collection

      const articles = await page.locator('[data-test-id^="blog-post-"]');
      await expect(articles).toHaveCount(0);

      await expect(page.getByText("0 Products")).toBeVisible();
    },
  );
});
