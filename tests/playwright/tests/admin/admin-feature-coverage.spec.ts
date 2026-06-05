import { client } from "@repo/db/client";
import { seed } from "@repo/db/seed";
import { expect, test } from "./fixtures";

async function createCustomerOrder(status: "PAID" | "NOT_PAID", quantity = 1) {
  const customer = await client.db.user.create({
    data: {
      name: `${status === "PAID" ? "Paid" : "Delivery"} Customer`,
      email: `admin-coverage-${status.toLowerCase()}-${Date.now()}-${Math.random()
        .toString(16)
        .slice(2)}@book.test`,
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
      status,
      paymentProvider: status === "PAID" ? "mock_credit_card" : "pay_on_delivery",
      paymentReference: `TXN-${status}-${Date.now()}`,
      totalAud: product.priceAud * quantity,
      items: {
        create: {
          postId: product.id,
          title: product.title,
          urlId: product.urlId,
          imageUrl: product.imageUrl,
          unitPriceAud: product.priceAud,
          quantity,
          lineTotalAud: product.priceAud * quantity,
        },
      },
    },
  });

  return { customer, order, product };
}

test.beforeEach(async () => {
  await seed();
  await client.db.user.deleteMany({
    where: {
      role: "CUSTOMER",
      OR: [
        {
          email: {
            endsWith: "@book.test",
          },
        },
        {
          email: {
            startsWith: "real-customer-",
          },
        },
      ],
    },
  });
});

test.describe("admin dashboard feature coverage", () => {
  test("dashboard shows all four overview cards", { tag: "@a2" }, async ({ userPage }) => {
    await userPage.goto("/");

    await expect(userPage.getByText("Total Books")).toBeVisible();
    await expect(userPage.getByText("Stock Units")).toBeVisible();
    await expect(
      userPage.getByLabel("Store overview").getByText("Customers"),
    ).toBeVisible();
    await expect(userPage.getByText("Stock Alerts")).toBeVisible();
  });

  test("dashboard shows the four balanced management panels", { tag: "@a2" }, async ({
    userPage,
  }) => {
    await userPage.goto("/");

    await expect(userPage.getByRole("heading", { name: "Recent Orders" })).toBeVisible();
    await expect(userPage.getByRole("heading", { name: "Inventory Alerts" })).toBeVisible();
    await expect(userPage.getByRole("heading", { name: "Best Selling Books" })).toBeVisible();
    await expect(userPage.getByRole("heading", { name: "Recently Added Books" })).toBeVisible();
  });

  test("dashboard omits the duplicate preview customer site button", { tag: "@a2" }, async ({
    userPage,
  }) => {
    await userPage.goto("/");

    await expect(userPage.getByRole("link", { name: "Preview Customer Site" })).not.toBeVisible();
    await expect(userPage.getByRole("link", { name: "Preview Store" })).toBeVisible();
  });

  test("dashboard shows empty best selling state before purchases", { tag: "@a2" }, async ({
    userPage,
  }) => {
    await userPage.goto("/");

    await expect(userPage.getByText("No sales data yet")).toBeVisible();
  });

  test("dashboard best selling chart appears after an order", { tag: "@a2" }, async ({
    userPage,
  }) => {
    const { product } = await createCustomerOrder("PAID", 3);

    await userPage.goto("/");

    await expect(userPage.getByText(product.title).first()).toBeVisible();
    await expect(userPage.getByText("3 sold")).toBeVisible();
  });

  test("dashboard recent orders show order total and customer", { tag: "@a2" }, async ({
    userPage,
  }) => {
    const { customer, order } = await createCustomerOrder("PAID");

    await userPage.goto("/");

    await expect(userPage.getByText(`Order #${order.id}`)).toBeVisible();
    await expect(userPage.getByText(customer.name)).toBeVisible();
  });

  test("orders page shows a paid order badge", { tag: "@a2" }, async ({ userPage }) => {
    const { order } = await createCustomerOrder("PAID");

    await userPage.goto("/orders");

    const row = userPage.getByRole("row", { name: new RegExp(`#${order.id}`) });
    await expect(row).toContainText("Paid");
  });

  test("orders page shows a not paid order badge", { tag: "@a2" }, async ({ userPage }) => {
    const { order } = await createCustomerOrder("NOT_PAID");

    await userPage.goto("/orders");

    const row = userPage.getByRole("row", { name: new RegExp(`#${order.id}`) });
    await expect(row).toContainText("Not paid");
  });

  test("orders page shows the customer email instead of hiding it", { tag: "@a2" }, async ({
    userPage,
  }) => {
    const { customer, order } = await createCustomerOrder("PAID");

    await userPage.goto("/orders");

    const row = userPage.getByRole("row", { name: new RegExp(`#${order.id}`) });
    await expect(row).toContainText(customer.email);
  });

  test("customers page omits generated test-domain customers", { tag: "@a2" }, async ({
    userPage,
  }) => {
    await userPage.goto("/customers");

    await expect(userPage.getByText("@book.test")).not.toBeVisible();
    await expect(userPage.getByText("@example.com")).not.toBeVisible();
  });

  test("customers page lists a real registered customer", { tag: "@a2" }, async ({
    userPage,
  }) => {
    const email = `real-customer-${Date.now()}@gmail.com`;

    await client.db.user.create({
      data: {
        name: "Gmail Customer",
        email,
        passwordHash: "test-only-password-hash",
        role: "CUSTOMER",
      },
    });

    await userPage.goto("/customers");

    const row = userPage.getByRole("row", { name: new RegExp(email) });
    await expect(row).toContainText("Gmail Customer");
    await expect(row).toContainText(email);
  });

  test("inventory out-of-stock filter shows unavailable books", { tag: "@a2" }, async ({
    userPage,
  }) => {
    await userPage.goto("/inventory");
    await userPage.getByLabel("Stock").selectOption("out-of-stock");

    await expect(userPage.getByRole("row", { name: /The Hobbit/ })).toBeVisible();
    await expect(userPage.getByText("Out").first()).toBeVisible();
  });

  test("inventory in-stock filter hides unavailable books", { tag: "@a2" }, async ({
    userPage,
  }) => {
    await userPage.goto("/inventory");
    await userPage.getByLabel("Stock").selectOption("in-stock");

    await expect(userPage.getByRole("row", { name: /The Hobbit/ })).not.toBeVisible();
  });

  test("inventory date filter narrows to a released book", { tag: "@a2" }, async ({
    userPage,
  }) => {
    const atomic = await client.db.post.findUniqueOrThrow({
      where: {
        urlId: "atomic-habits",
      },
      select: {
        date: true,
      },
    });

    await userPage.goto("/inventory");
    await userPage
      .getByLabel("Date Released")
      .fill(atomic.date.toISOString().slice(0, 10));

    await expect(userPage.getByRole("row", { name: /Atomic Habits/ })).toBeVisible();
    await expect(userPage.getByText("Showing 1 of")).toBeVisible();
  });

  test("preview page uses an embedded customer storefront frame", { tag: "@a2" }, async ({
    userPage,
  }) => {
    await userPage.goto("/preview");

    await expect(userPage.locator('iframe[title="Customer storefront preview"]')).toBeVisible();
    await expect(userPage.getByText("Administrative read-only preview")).toBeVisible();
  });
});
