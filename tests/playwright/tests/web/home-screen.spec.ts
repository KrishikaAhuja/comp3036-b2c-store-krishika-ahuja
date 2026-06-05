import { seed } from "@repo/db/seed";
import { expect, test, type Page } from "./fixtures";

test.beforeEach(async () => {
  await seed();
});

test.describe("customer bookstore home", () => {
  async function checkItem(page: Page, title: string, href: string, count?: number) {
    const link = page.getByTitle(title);
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", href);

    if (count !== undefined) {
      await expect(link.getByTestId("post-count")).toContainText(String(count));
    }
  }

  test("shows active books only", { tag: "@a1" }, async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("article")).toHaveCount(14);
    await expect(page.getByText("The Silent Patient")).toBeVisible();
    await expect(page.getByText("Book Lovers")).toBeVisible();
    await expect(page.getByText("The Hobbit")).toBeVisible();
    await expect(page.getByText("Atomic Habits")).toBeVisible();
    await expect(page.getByText("Matilda")).toBeVisible();
    await expect(page.getByText("Sapiens")).toBeVisible();
    await expect(page.getByText("Wonder")).not.toBeVisible();
  });

  test("shows bookstore navigation summaries", { tag: "@a1" }, async ({ page }) => {
    await page.goto("/");

    await checkItem(page, "Category / Mystery", "/category/mystery", 3);
    await checkItem(page, "Category / Romance", "/category/romance", 3);
    await checkItem(page, "Category / Fantasy", "/category/fantasy", 3);
    await checkItem(page, "Category / Children", "/category/children", 2);
    await checkItem(page, "Category / Nonfiction", "/category/nonfiction", 3);

    await checkItem(page, "Arrivals / 2020-2029", "/history/2020-2029", 4);
    await checkItem(page, "Arrivals / 2010-2019", "/history/2010-2019", 5);
    await checkItem(page, "Arrivals / 2000-2009", "/history/2000-2009", 1);
    await checkItem(page, "Arrivals / 1930-1939", "/history/1930-1939", 1);
    await expect(page.getByText("December, 2012")).not.toBeVisible();

    await checkItem(page, "Age Range / Adult", "/tags/adult", 10);
    await checkItem(page, "Age Range / Ages 12+", "/tags/ages-12", 2);
  });

  test("book cards show bookstore details and actions", { tag: "@a1" }, async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const item = page.getByTestId("blog-post-5");
    await expect(item).toBeVisible();
    await expect(item.getByText("Atomic Habits")).toHaveAttribute("href", "/post/atomic-habits");
    await expect(item.getByText("Nonfiction", { exact: true })).toBeVisible();
    await expect(item.getByText("#Adult")).toBeVisible();
    await expect(item.getByText("Listed 16 Oct 2018")).toBeVisible();
    await expect(item.getByText("$28")).toBeVisible();
    await expect(item.getByText("35 copies left")).toBeVisible();
    await expect(item.getByRole("button", { name: "Add to Book Bag" })).toBeVisible();
    await expect(item.getByRole("link", { name: "View Book" })).toBeVisible();

    const outOfStockItem = page.getByTestId("blog-post-3");
    await outOfStockItem
      .getByRole("button", { name: "Flip The Hobbit to details" })
      .click();
    await expect(outOfStockItem.getByText("The Hobbit")).toBeVisible();
    await expect(
      outOfStockItem.getByText("Out of stock", { exact: true }),
    ).toBeVisible();
    await expect(
      outOfStockItem.getByRole("button", { name: "Out of Stock" }),
    ).toBeDisabled();
    await expect(
      outOfStockItem.getByRole("button", { name: "Add to Book Bag" }),
    ).not.toBeVisible();
  });

  test("search box routes to search page", { tag: "@a1" }, async ({ page }) => {
    await page.goto("/");

    await page.getByPlaceholder("Search books...").fill("habits");
    await expect(page).toHaveURL("/search?q=habits");
  });

  test("dark mode switch still works", { tag: "@a1" }, async ({ page }) => {
    await page.goto("/");

    const html = await page.getAttribute("html", "data-theme");
    if (html === "dark") {
      await page.getByText("Light Mode").click({ force: true });
      await expect(await page.getAttribute("html", "data-theme")).toBe("light");
    } else {
      await page.getByText("Dark Mode").click({ force: true });
      await expect(await page.getAttribute("html", "data-theme")).toBe("dark");
    }
  });
});
