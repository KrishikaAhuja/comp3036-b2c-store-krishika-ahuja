import { expect, test } from "./fixtures";

function uniqueCustomerEmail() {
  return `customer-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;
}

test.describe("CUSTOMER AUTH SCREEN", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test(
    "shows login and register modes",
    { tag: "@a1" },
    async ({ page }) => {
      await page.goto("/auth");

      await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Register" })).toBeVisible();
      await expect(page.getByLabel("Email")).toBeVisible();
      await expect(page.getByLabel("Password", { exact: true })).toBeVisible();

      await page.getByRole("button", { name: "Register" }).click();

      await expect(page.getByLabel("Name")).toBeVisible();
      await expect(page.getByLabel("Repeat password")).toBeVisible();
    },
  );

  test(
    "validates registration before submitting",
    { tag: "@a1" },
    async ({ page }) => {
      await page.goto("/auth");
      await page.getByRole("button", { name: "Register" }).click();

      await page.getByLabel("Name").fill("Test Customer");
      await page.getByLabel("Email").fill(uniqueCustomerEmail());
      await page.getByLabel("Password", { exact: true }).fill("password123");
      await page.getByLabel("Repeat password").fill("different123");
      await page.getByRole("button", { name: "Create account" }).click();

      await expect(page.getByText("Passwords do not match.")).toBeVisible();
    },
  );

  test(
    "registers a customer and signs them in",
    { tag: "@a1" },
    async ({ page }) => {
      const email = uniqueCustomerEmail();

      await page.goto("/auth");
      await page.getByRole("button", { name: "Register" }).click();

      await page.getByLabel("Name").fill("Test Customer");
      await page.getByLabel("Email").fill(email);
      await page.getByLabel("Password", { exact: true }).fill("password123");
      await page.getByLabel("Repeat password").fill("password123");
      await page.getByRole("button", { name: "Create account" }).click();

      await expect(page).toHaveURL("/");

      const cookies = await page.context().cookies();
      expect(cookies.some((cookie) => cookie.name === "customer_auth_token")).toBe(
        true,
      );
    },
  );

  test(
    "shows an error for incorrect customer login",
    { tag: "@a1" },
    async ({ page }) => {
      await page.goto("/auth");

      await page.getByLabel("Email").fill(uniqueCustomerEmail());
      await page.getByLabel("Password", { exact: true }).fill("wrongpass");
      await page.getByRole("button", { name: "Sign in" }).click();

      await expect(page.getByText("Incorrect email or password.")).toBeVisible();
    },
  );
});
