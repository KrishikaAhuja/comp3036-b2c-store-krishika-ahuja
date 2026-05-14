import { expect, test } from "./fixtures";

test.describe("HISTORY SCREEN", () => {
  test(
    "Existing history",
    {
      tag: "@a1",
    },
    async ({ page }) => {
      await page.goto("/history/2024/12");

      // HISTORY SCREEN > Displays posts from year and month specified in the url (e.g. /history/2024/12)

      const articles = await page.locator('[data-test-id^="blog-post-"]');
      await expect(articles).toHaveCount(1);

      await expect(page.getByTestId("blog-post-3")).toBeVisible();
      await expect(
        page.getByText("No front end framework is the best"),
      ).toBeVisible();
    },
  );

  test(
    "Invalid History",
    {
      tag: "@a1",
    },
    async ({ page }) => {
      await page.goto("/history/2024/1");

      // HISTORY SCREEN > Displays "0 Posts" when search does not find anything

      const articles = await page.locator('[data-test-id^="blog-post-"]');
      await expect(articles).toHaveCount(0);

      await expect(page.getByText("0 Posts")).toBeVisible();
    },
  );
});
