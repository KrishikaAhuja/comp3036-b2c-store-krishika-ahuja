import { seed } from "@repo/db/seed";
import { expect, test } from "./fixtures";

async function openFilters(page: any) {
  await page.getByRole("button", { name: "All Filters" }).click();
}

async function productPrices(page: any) {
  const cards = await page.locator("article").allTextContents();
  return cards.map((text: string) => {
    const match = text.match(/\$(\d[\d,]*)/);
    return match ? Number(match[1].replaceAll(",", "")) : 0;
  });
}

test.beforeAll(async () => {
  await seed();
});

test.describe("ADMIN LIST SCREEN", () => {
  test.beforeAll(async () => {
    await seed();
  });

  test(
    "Show all products",
    {
      tag: "@a2",
    },
    async ({ userPage }) => {
      await userPage.goto("/");

      await expect(await userPage.locator("article").count()).toBe(5);
    },
  );

  test(
    "Filter by content",
    {
      tag: "@a2",
    },
    async ({ userPage }) => {
      await userPage.goto("/");

      // LIST SCREEN > On the top is a filter screen that allows to filter products by name or details
      await openFilters(userPage);
      await userPage.getByLabel("Search product").fill("AeroBook");
      await expect(await userPage.locator("article").count()).toBe(1);
      await expect(
        userPage.getByText("AeroBook 14 Pro Laptop"),
      ).toBeVisible();

      await userPage.getByLabel("Search product").fill("headphones");
      await expect(
        userPage.getByText("PulseWave Noise-Cancelling Headphones"),
      ).toBeVisible();

      await userPage.getByLabel("Search product").clear();
      await expect(await userPage.locator("article").count()).toBe(5);
    },
  );

  test(
    "Filter by tag",
    {
      tag: "@a2",
    },
    async ({ userPage }) => {
      await userPage.goto("/");

      // LIST SCREEN > On the top is a filter screen that allows to filter products by collection
      await openFilters(userPage);
      await userPage.getByLabel("Collection").fill("Wireless");
      await expect(await userPage.locator("article").count()).toBe(2);
      await expect(
        userPage.getByText("PulseWave Noise-Cancelling Headphones"),
      ).toBeVisible();
      await expect(
        userPage.getByText("GlidePro Wireless Mouse"),
      ).toBeVisible();
      await userPage.getByLabel("Collection").clear();
    },
  );

  test(
    "Filter by date",
    {
      tag: "@a2",
    },
    async ({ userPage }) => {
      await userPage.goto("/");

      // LIST SCREEN > On the top is a filter screen that allows to filter products by date
      await openFilters(userPage);
      await userPage
        .getByLabel("Date added")
        .pressSequentially("01012022");
      await expect(await userPage.locator("article").count()).toBe(3);
      await expect(
        userPage.getByText("AeroBook 14 Pro Laptop"),
      ).toBeVisible();
      await expect(
        userPage.getByText("Vertex RGB Mechanical Keyboard"),
      ).toBeVisible();
      await userPage.getByLabel("Date added").clear();
    },
  );

  test(
    "Combine Filters",
    {
      tag: "@a2",
    },
    async ({ userPage }) => {
      await userPage.goto("/");

      // LIST SCREEN > On the top is a filter screen that allows to filter by visibility
      await openFilters(userPage);
      await userPage.getByLabel("Collection").fill("RGB");
      await userPage
        .getByLabel("Date added")
        .pressSequentially("01012022");
      await expect(await userPage.locator("article").count()).toBe(1);
      await expect(
        userPage.getByText("Vertex RGB Mechanical Keyboard"),
      ).toBeVisible();
    },
  );

  test(
    "Sort items",
    {
      tag: "@a2",
    },
    async ({ userPage }) => {
      await userPage.goto("/");

      // LIST SCREEN > Users can sort products by creation date and price
      await openFilters(userPage);

      await userPage.getByLabel("Sort by").selectOption("date-desc");
      let articles = await userPage.locator("article").all();

      expect(await articles[0].innerText()).toContain(
        "MagDock 3-in-1 Charging Station",
      );
      expect(await articles[1].innerText()).toContain(
        "Vertex RGB Mechanical Keyboard",
      );
      expect(await articles[2].innerText()).toContain(
        "AeroBook 14 Pro Laptop",
      );
      expect(await articles[3].innerText()).toContain(
        "PulseWave Noise-Cancelling Headphones",
      );
      expect(await articles[4].innerText()).toContain(
        "GlidePro Wireless Mouse",
      );

      await userPage.getByLabel("Sort by").selectOption("date-asc");
      articles = await userPage.locator("article").all();

      expect(await articles[0].innerText()).toContain(
        "GlidePro Wireless Mouse",
      );
      expect(await articles[1].innerText()).toContain(
        "PulseWave Noise-Cancelling Headphones",
      );
      expect(await articles[2].innerText()).toContain(
        "AeroBook 14 Pro Laptop",
      );
      expect(await articles[3].innerText()).toContain(
        "Vertex RGB Mechanical Keyboard",
      );
      expect(await articles[4].innerText()).toContain(
        "MagDock 3-in-1 Charging Station",
      );

      await userPage.getByLabel("Sort by").selectOption("price-asc");
      let prices = await productPrices(userPage);
      expect(prices).toEqual([...prices].sort((a, b) => a - b));

      await userPage.getByLabel("Sort by").selectOption("price-desc");
      prices = await productPrices(userPage);
      expect(prices).toEqual([...prices].sort((a, b) => b - a));
    },
  );

  test(
    "List items",
    {
      tag: "@a2",
    },
    async ({ userPage }) => {
      await userPage.goto("/");

      // LIST SCREEN > The list product item displays the image, name and metadata
      const article = await userPage.locator("article").first();
      await expect(
        article.getByText("MagDock 3-in-1 Charging Station"),
      ).toBeVisible();
      await expect(article.locator("img").first()).toBeVisible();

      // LIST SCREEN > The list product items display metadata such as category, collections, stock, and active status
      await expect(article.getByText("#Chargers, #Desk Setup")).toBeVisible();
      await expect(article.getByText("Added on Aug 8, 2025")).toBeVisible();
      await expect(article.getByText("Category: Accessories")).toBeVisible();
      await expect(article.getByText("$119")).toBeVisible();
      await expect(article.getByText("Stock: 35")).toBeVisible();
      await expect(article.getByText("In stock")).toBeVisible();
      await expect(article.getByRole("link", { name: "Edit" })).toBeVisible();
      await expect(article.getByRole("button", { name: "Delete" })).toBeVisible();
    },
  );

  test(
    "Move to detail screen",
    {
      tag: "@a2",
    },
    async ({ userPage }) => {
      await userPage.goto("/");

      // LIST SCREEN > Clicking on the title takes the user to the MODIFY SCREEN, allowing the user to modify the current product
      await userPage.getByText("Vertex RGB Mechanical Keyboard").click();
      await expect(userPage).toHaveURL(
        "/post/no-front-end-framework-is-the-best",
      );
    },
  );

  test(
    "Move to create product screen",
    {
      tag: "@a2",
    },
    async ({ userPage }) => {
      await userPage.goto("/");

      // LIST SCREEN > There is a button to create new products
      await expect(userPage.getByText("Create Product")).toBeVisible();

      // LIST SCREEN > Clicking on the "Create Product" button takes the user to the CREATE SCREEN
      await userPage.locator('a:has-text("Create Product")').click();
      await expect(userPage).toHaveURL("/posts/create");
    },
  );

  test(
    "Can hide / show products in store",
    {
      tag: "@a3",
    },
    async ({ userPage }) => {
      await seed();
      await userPage.goto("/");

      let article = userPage.locator("article").first();
      await expect(
        article.getByRole("button", { name: "Hide from Store" }),
      ).toBeVisible();
      await expect(article.getByText("In stock")).toBeVisible();

      await article.getByRole("button", { name: "Hide from Store" }).click();

      article = userPage.locator("article").first();
      await expect(
        article.getByRole("button", { name: "Show in Store" }),
      ).toBeVisible();
      await expect(article.getByText("In stock")).toBeVisible();

      await userPage.reload();

      article = userPage.locator("article").first();
      await expect(
        article.getByRole("button", { name: "Show in Store" }),
      ).toBeVisible();
    },
  );

});
