import { client } from "@repo/db/client";
import { seed } from "@repo/db/seed";
import { expect, test } from "./fixtures";

test.beforeEach(async () => {
  await seed();
});

test.describe("admin bookstore", () => {
  test("dashboard and inventory show seeded books", { tag: "@a2" }, async ({ userPage }) => {
    await userPage.goto("/");

    await expect(userPage.getByRole("heading", { name: "Admin Dashboard" })).toBeVisible();
    await expect(userPage.getByText("Total Books")).toBeVisible();
    await expect(userPage.getByText("4 active books")).toBeVisible();
    await expect(userPage.getByRole("link", { name: "Add Book" }).first()).toBeVisible();

    await userPage.getByRole("link", { name: "Inventory", exact: true }).click();
    await expect(userPage.getByRole("heading", { name: "Inventory", exact: true })).toBeVisible();
    await expect(userPage.getByRole("heading", { name: "Book Inventory" })).toBeVisible();
    const atomicRow = userPage.getByRole("row", { name: /Atomic Habits/ });
    await expect(atomicRow).toBeVisible();
    await expect(atomicRow).toContainText("Nonfiction");
    await expect(atomicRow).toContainText("$28");
    await expect(atomicRow).toContainText("Oct 16, 2018");
  });

  test("inventory filters and sorts books", { tag: "@a2" }, async ({ userPage }) => {
    await userPage.goto("/inventory");

    await userPage.getByLabel("Search").fill("hobbit");
    await expect(userPage.getByText("The Hobbit")).toBeVisible();
    await expect(userPage.getByText("Atomic Habits")).not.toBeVisible();

    await userPage.getByLabel("Search").fill("");
    await userPage.getByLabel("Genre").selectOption("Nonfiction");
    await expect(userPage.getByText("Atomic Habits")).toBeVisible();
    await expect(userPage.getByText("Book Lovers")).not.toBeVisible();

    await userPage.goto("/inventory");
    await userPage.getByLabel("Sort").selectOption("date-asc");
    await expect(userPage.locator("tbody tr").first()).toContainText("The Hobbit");
  });

  test("create and edit forms use bookstore fields without active checkbox", { tag: "@a2" }, async ({ userPage }) => {
    await userPage.goto("/posts/create");

    await expect(userPage.getByRole("heading", { name: "Create Book" })).toBeVisible();
    await expect(userPage.getByLabel("Book Title")).toBeVisible();
    await expect(userPage.getByLabel("Genre")).toBeVisible();
    await expect(userPage.getByLabel("Short Description")).toBeVisible();
    await expect(userPage.getByLabel("Book Details")).toBeVisible();
    await expect(userPage.getByLabel("Image URL")).toBeVisible();
    await expect(userPage.getByLabel("Price AUD")).toBeVisible();
    await expect(userPage.getByLabel("Stock Quantity")).toBeVisible();
    await expect(userPage.getByLabel("Active in store")).not.toBeVisible();

    await userPage.goto("/post/atomic-habits");
    await expect(userPage.getByRole("heading", { name: "Update Book" })).toBeVisible();
    await expect(userPage.getByLabel("Book Title")).toBeVisible();
    await expect(userPage.getByText("Active in store")).toBeVisible();
    await expect(userPage.getByLabel("Active in store")).not.toBeVisible();
  });

  test("validation covers required bookstore fields", { tag: "@a2" }, async ({ userPage }) => {
    await userPage.goto("/posts/create");

    await userPage.getByRole("button", { name: "Create Book" }).click();

    await expect(userPage.getByText("Book title is required")).toBeVisible();
    await expect(userPage.getByText("Category is required")).toBeVisible();
    await expect(userPage.getByText("Description is required")).toBeVisible();
    await expect(userPage.getByText("Book details are required")).toBeVisible();
    await expect(userPage.getByText("Image URL is required")).toBeVisible();

    await userPage.getByLabel("Price AUD").fill("-1");
    await userPage.getByLabel("Stock Quantity").fill("1.5");
    await userPage.getByRole("button", { name: "Create Book" }).click();

    await expect(userPage.getByText("Price must be 0 or more")).toBeVisible();
    await expect(userPage.getByText("Stock must be a whole number 0 or more")).toBeVisible();
  });

  test("admin API updates a book without changing release date", { tag: "@a3" }, async ({ userPage }) => {
    const before = await client.db.post.findUniqueOrThrow({
      where: { urlId: "atomic-habits" },
      select: { date: true },
    });

    const response = await userPage.request.put("/api/posts", {
      data: {
        id: 5,
        title: "Atomic Habits",
        description: "Updated practical guidance for building better habits.",
        content: "# Book details\n\n**Author:** James Clear",
        imageUrl: "https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg",
        category: "Nonfiction",
        priceAud: 28,
        stockQuantity: 35,
        active: true,
      },
    });
    expect(response.status()).toBe(200);

    const after = await client.db.post.findUniqueOrThrow({
      where: { urlId: "atomic-habits" },
      select: { description: true, date: true },
    });
    expect(after.description).toBe("Updated practical guidance for building better habits.");
    expect(after.date.toISOString()).toBe(before.date.toISOString());
  });

  test("can delete a book from inventory", { tag: "@a2" }, async ({ userPage }) => {
    await userPage.goto("/inventory");

    const row = userPage.getByRole("row", { name: /Book Lovers/ });
    await expect(row).toBeVisible();
    await row.getByRole("button", { name: "Delete" }).click();

    await expect(userPage.getByText("Book Lovers")).not.toBeVisible();
  });
});
