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
    await expect(userPage.getByText("14 live in store")).toBeVisible();
    await expect(userPage.getByRole("link", { name: "Add Book" }).first()).toBeVisible();
    await expect(
      userPage.getByRole("link", { name: "Preview Store" }),
    ).toHaveAttribute("href", "/preview");

    await userPage.getByRole("link", { name: "Inventory", exact: true }).click();
    await expect(userPage.getByRole("heading", { name: "Inventory", exact: true })).toBeVisible();
    await expect(userPage.getByRole("heading", { name: "Book Inventory" })).toBeVisible();
    const atomicRow = userPage.getByRole("row", { name: /Atomic Habits/ });
    await expect(atomicRow).toBeVisible();
    await expect(atomicRow).toContainText("Nonfiction");
    await expect(atomicRow).toContainText("$28");
    await expect(atomicRow).toContainText("Oct 16, 2018");
  });

  test("orders page shows completed customer purchases", { tag: "@a2" }, async ({ userPage }) => {
    const customer = await client.db.user.create({
      data: {
        name: "Orders Customer",
        email: `orders-${Date.now()}@book.test`,
        passwordHash: "test-only-password-hash",
        role: "CUSTOMER",
      },
    });
    const product = await client.db.post.findFirstOrThrow({
      where: {
        active: true,
      },
      orderBy: {
        id: "asc",
      },
    });
    const order = await client.db.order.create({
      data: {
        userId: customer.id,
        status: "PAID",
        paymentProvider: "mock",
        paymentReference: "TXN-TEST-1234",
        totalAud: product.priceAud,
        items: {
          create: {
            postId: product.id,
            title: product.title,
            urlId: product.urlId,
            imageUrl: product.imageUrl,
            unitPriceAud: product.priceAud,
            quantity: 1,
            lineTotalAud: product.priceAud,
          },
        },
      },
    });

    await userPage.goto("/orders");

    await expect(
      userPage.getByRole("heading", { name: "Orders", exact: true }),
    ).toBeVisible();
    const row = userPage.getByRole("row", { name: new RegExp(`#${order.id}`) });
    await expect(row).toContainText("Orders Customer");
    await expect(row).toContainText("1 item");
    await expect(row).toContainText("TXN-TEST-1234");
    await expect(row).toContainText("Paid");
  });

  test("customer site preview stays inside admin", { tag: "@a2" }, async ({ userPage }) => {
    await userPage.goto("/");

    await userPage.getByRole("link", { name: "Preview Store" }).click();

    await expect(userPage).toHaveURL("/preview");
    await expect(
      userPage.getByRole("heading", { name: "Customer Preview" }),
    ).toBeVisible();
    await expect(
      userPage.getByText("Administrative read-only preview of the customer storefront"),
    ).toBeVisible();
    await expect(userPage.getByText("Customer browsing")).not.toBeVisible();

    const preview = userPage.frameLocator(
      'iframe[title="Customer storefront preview"]',
    );
    await expect(preview.getByPlaceholder("Search books...")).toBeVisible();
    await expect(preview.getByText("Browse books by genre")).toBeVisible();
    await expect(preview.getByRole("link", { name: /Mystery/ })).toBeVisible();
    await expect(preview.getByRole("button", { name: /theme|mode/i })).toBeVisible();
    await expect(preview.getByText(/Account:/)).not.toBeVisible();
    await expect(preview.getByRole("link", { name: /Book Bag/ })).not.toBeVisible();
    await expect(preview.getByRole("button", { name: "Add to Book Bag" })).not.toBeVisible();

    const card = preview.locator("[data-test-id^='blog-post-']").first();
    await card.getByRole("button", { name: /Flip .* to details/ }).click();
    await expect(card.getByRole("button", { name: "Back to cover" })).toBeVisible();
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
    await expect(userPage.getByRole("link", { name: "Back to Inventory" })).toHaveAttribute(
      "href",
      "/inventory",
    );
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
