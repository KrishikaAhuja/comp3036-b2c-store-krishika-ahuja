import { client } from "@repo/db/client";
import { seed } from "@repo/db/seed";
import { expect, test } from "./fixtures";

test.describe("CLIENTSTORE", () => {
  test.beforeEach(async () => {
    await seed();
    await client.db.post.update({
      where: { id: 1 },
      data: { active: false },
    });
  });

  test(
    "hidden products do not appear in customer product lists",
    { tag: "@a3" },
    async ({ page }) => {
      await page.goto("/");

      await expect(page.getByText("AeroBook 14 Pro Laptop")).not.toBeVisible();
      await expect(page.locator('[data-test-id^="blog-post-"]')).toHaveCount(3);

      await page.goto("/search?q=AeroBook");
      await expect(page.getByText("0 Products")).toBeVisible();
      await expect(page.getByText("AeroBook 14 Pro Laptop")).not.toBeVisible();

      await page.goto("/category/electronics");
      await expect(page.getByText("0 Products")).toBeVisible();
      await expect(page.getByText("AeroBook 14 Pro Laptop")).not.toBeVisible();
    },
  );

  test(
    "hidden product detail page is not available to customers",
    { tag: "@a3" },
    async ({ page }) => {
      await page.goto("/post/boost-your-conversion-rate");

      await expect(page.getByText("Product not found")).toBeVisible();
      await expect(page.getByText("AeroBook 14 Pro Laptop")).not.toBeVisible();
    },
  );
});
