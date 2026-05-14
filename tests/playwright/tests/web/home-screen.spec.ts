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

      await expect(await page.locator("article").count()).toBe(3);
    },
  );

  test(
    "Category Links",
    {
      tag: "@a1",
    },
    async ({ page }) => {
      await page.goto("/");

      // HOME SCREEN > User must see the list of blog post categories, where each category points to UI showing only posts of that category

      await checkItem(page, "Category / React", "/category/react");
      await checkItem(page, "Category / Node", "/category/node");
      await checkItem(page, "Category / Mongo", "/category/mongo");
      await checkItem(page, "Category / DevOps", "/category/devops");
    },
  );

  test(
    "History Links",
    {
      tag: "@a1",
    },
    async ({ page }) => {
      await page.goto("/");

      // HOME SCREEN > User must see the history of blog posts, showing month and year, where each moth, year tuple points to UI showing only posts of that category

      await checkItem(page, "History / December, 2024", "/history/2024/12", 1);
      await checkItem(page, "History / April, 2022", "/history/2022/4", 1);
      await checkItem(page, "History / March, 2020", "/history/2020/3", 1);

      // HOME SCREEN > Tags and history items shown are only considered from active posts

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

      // HOME SCREEN > User must see the list of blog post tags, where each tag points to UI showing only posts of that category

      await checkItem(page, "Tag / Back-End", "/tags/back-end", 1);
      await checkItem(page, "Tag / Front-End", "/tags/front-end", 2);
      await checkItem(page, "Tag / Optimisation", "/tags/optimisation", 1);
      await checkItem(page, "Tag / Dev Tools", "/tags/dev-tools", 1);

      // HOME SCREEN > Tags and history items shown are only considered from active posts

      await expect(page.getByText("Mainframes")).not.toBeVisible();
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

      // HOME SCREEN > The list shows the following items:
      // - short description
      // - date
      // - image
      // - tags
      // - likes
      // - views

      await expect(item.getByText("Boost your conversion rate")).toBeVisible();
      await expect(
        item.getByText("Boost your conversion rate"),
      ).toHaveAttribute("href", "/post/boost-your-conversion-rate");

      await expect(item.getByText("Node")).toBeVisible();
      await expect(item.getByText("#Back-End")).toBeVisible();
      await expect(item.getByText("#Databases")).toBeVisible();
      await expect(item.getByText("18 Apr 2022")).toBeVisible();
      await expect(item.getByText("320 views")).toBeVisible();
      await expect(item.getByText("3 likes")).toBeVisible();
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

      // HOME SCREEN > There is a search functionality that filters blogs based on string found in title or description

      await page.getByPlaceholder("Search").fill("Fatboy");
      await expect(page).toHaveURL("/search?q=Fatboy");
    },
  );
});
