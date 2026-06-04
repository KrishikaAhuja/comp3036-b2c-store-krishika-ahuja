import { client } from "@repo/db/client";
import { seed } from "@repo/db/seed";
import { expect, test } from "./fixtures";

test.beforeEach(async () => {
  await seed();
});

test.describe("customer bookstore catalog pages", () => {
  test("category pages filter active books by genre", { tag: "@a1" }, async ({ page }) => {
    await page.goto("/category/nonfiction");
    await expect(page.getByText("Atomic Habits")).toBeVisible();
    await expect(page.getByText("The Hobbit")).not.toBeVisible();

    await page.goto("/category/children");
    await expect(page.getByText("Matilda")).toBeVisible();
    await expect(page.getByText("Charlotte's Web")).toBeVisible();
    await expect(page.getByText("Wonder")).not.toBeVisible();
  });

  test("age range pages filter active books by tag", { tag: "@a1" }, async ({ page }) => {
    await page.goto("/tags/adult");
    await expect(page.locator("article")).toHaveCount(10);
    await expect(page.getByText("Atomic Habits")).toBeVisible();

    await page.goto("/tags/ages-12");
    await expect(page.locator("article")).toHaveCount(2);
    await expect(page.getByText("The Hobbit")).toBeVisible();
    await expect(page.getByText("A Wrinkle in Time")).toBeVisible();
  });

  test("arrival pages filter active books by release month", { tag: "@a1" }, async ({ page }) => {
    await page.goto("/history/2018/10");
    await expect(page.getByText("Atomic Habits")).toBeVisible();
    await expect(page.getByText("Listed 16 Oct 2018")).toBeVisible();

    await page.goto("/history/2012/12");
    await expect(page.getByText("0 Books")).toBeVisible();
    await expect(page.getByText("Wonder")).not.toBeVisible();
  });

  test("search matches title and description on active books", { tag: "@a1" }, async ({ page }) => {
    await page.goto("/search?q=habits");
    await expect(page.getByText("Atomic Habits")).toBeVisible();
    await expect(page.getByText("Book Lovers")).not.toBeVisible();

    await page.goto("/search?q=kindness");
    await expect(page.getByText("0 Books")).toBeVisible();
    await expect(page.getByText("Wonder")).not.toBeVisible();
  });

  test("hidden book lists and detail pages are unavailable", { tag: "@a1" }, async ({ page }) => {
    await client.db.post.update({
      where: { urlId: "atomic-habits" },
      data: { active: false },
    });

    await page.goto("/");
    await expect(page.getByText("Atomic Habits")).not.toBeVisible();

    await page.goto("/search?q=atomic");
    await expect(page.getByText("0 Books")).toBeVisible();

    await page.goto("/post/atomic-habits");
    await expect(page.getByText("Book not found")).toBeVisible();
  });
});
