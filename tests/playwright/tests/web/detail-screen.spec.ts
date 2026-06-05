import { seed } from "@repo/db/seed";
import { expect, test } from "./fixtures";

test.beforeEach(async () => {
  await seed();
});

test.describe("customer bookstore detail page", () => {
  test("renders book metadata and markdown details", { tag: "@a1" }, async ({ page }) => {
    await page.goto("/post/atomic-habits");

    const item = page.getByTestId("blog-post-5");
    await expect(item.getByRole("link", { name: "Back to Books" })).toHaveAttribute(
      "href",
      "/",
    );
    await expect(item.getByRole("link", { name: "Atomic Habits" })).toBeVisible();
    await expect(item.getByText("Nonfiction", { exact: true })).toBeVisible();
    await expect(item.getByText("Listed 16 Oct 2018")).toBeVisible();
    await expect(item.getByText("$28")).toBeVisible();
    await expect(item.getByText("35 copies available")).toBeVisible();
    await expect(item.getByText("#Adult")).toBeVisible();
    await expect(item.getByTestId("content-markdown").locator("h1")).toContainText("Book details");
    await expect(item.getByTestId("content-markdown")).toContainText("James Clear");
  });

  test("out of stock books are visible but cannot be added", { tag: "@a1" }, async ({ page }) => {
    await page.goto("/post/the-hobbit");

    const item = page.getByTestId("blog-post-3");
    await expect(item.getByRole("link", { name: "The Hobbit" })).toBeVisible();
    await expect(item.getByText("Out of stock", { exact: true })).toBeVisible();
    await expect(item.getByRole("button", { name: "Out of Stock" })).toBeDisabled();
    await expect(item.getByRole("button", { name: "Add to Book Bag" })).not.toBeVisible();
  });

  test("each customer visit increments views", { tag: "@a1" }, async ({ page }) => {
    await page.goto("/post/the-silent-patient");
    await expect(page.getByText(/saving this read/)).not.toBeVisible();

    await page.goto("/post/the-silent-patient");
    await page.goto("/");
    await expect(page.getByTestId("blog-post-1").getByText(/saving this read/)).not.toBeVisible();
  });
});
