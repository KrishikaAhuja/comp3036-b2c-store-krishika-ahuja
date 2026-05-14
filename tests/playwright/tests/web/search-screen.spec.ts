import { expect, test } from "./fixtures";

test.describe("SEARCH SCREEN", () => {
  test(
    "Existing search result",
    {
      tag: "@a1",
    },
    async ({ page }) => {
      await page.goto("/search?q=Fat");

      // SEARCH SCREEN > Displays results based on search string stored in the query string (e.g. /search?q=Fat)

      // console.log(await page.innerHTML("body"));

      const articles = await page.locator('[data-test-id^="blog-post-"]');
      await expect(articles).toHaveCount(1);

      await expect(page.getByTestId("blog-post-2")).toBeVisible();
      await expect(
        page.getByText("Better front ends with Fatboy Slim"),
      ).toBeVisible();
    },
  );

  test(
    "Search finds multiple posts",
    {
      tag: "@a1",
    },
    async ({ page }) => {
      await page.goto("/search?q=front");

      // SEARCH SCREEN > Displays results based on search string stored in the query string (e.g. /search?q=Fat)

      const articles = await page.locator('[data-test-id^="blog-post-"]');
      await expect(articles).toHaveCount(2);

      await expect(page.getByTestId("blog-post-2")).toBeVisible();
      await expect(
        page.getByText("Better front ends with Fatboy Slim"),
      ).toBeVisible();

      await expect(page.getByTestId("blog-post-3")).toBeVisible();
      await expect(
        page.getByText("No front end framework is the best"),
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

      // SEARCH SCREEN > Displays "0 Posts" when search does not find anything

      const articles = await page.locator('[data-test-id^="blog-post-"]');
      await expect(articles).toHaveCount(0);

      await expect(page.getByText("0 Posts")).toBeVisible();
    },
  );
});
