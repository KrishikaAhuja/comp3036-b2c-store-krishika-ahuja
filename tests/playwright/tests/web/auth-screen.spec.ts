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
    "validates required customer fields",
    { tag: "@a1" },
    async ({ page }) => {
      await page.goto("/auth");

      await page.getByRole("button", { name: "Sign in" }).click();
      await expect(page.getByText("Enter your email address.")).toBeVisible();

      await page.getByRole("button", { name: "Register" }).click();
      await page.getByRole("button", { name: "Create account" }).click();
      await expect(page.getByText("Enter your name.")).toBeVisible();
    },
  );

  test(
    "validates short registration password",
    { tag: "@a1" },
    async ({ page }) => {
      await page.goto("/auth");
      await page.getByRole("button", { name: "Register" }).click();

      await page.getByLabel("Name").fill("Test Customer");
      await page.getByLabel("Email").fill(uniqueCustomerEmail());
      await page.getByLabel("Password", { exact: true }).fill("short");
      await page.getByLabel("Repeat password").fill("short");
      await page.getByRole("button", { name: "Create account" }).click();

      await expect(
        page.getByText("Password must be at least 8 characters."),
      ).toBeVisible();
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
    "returns customers to protected pages after sign in",
    { tag: "@a1" },
    async ({ page }) => {
      const email = uniqueCustomerEmail();

      const response = await page.request.post("/api/auth/register", {
        data: {
          name: "Redirect Customer",
          email,
          password: "password123",
        },
      });
      expect(response.status()).toBe(201);

      await page.goto("/auth?next=/cart");
      await page.getByLabel("Email").fill(email);
      await page.getByLabel("Password", { exact: true }).fill("password123");
      await page.getByRole("button", { name: "Sign in" }).click();

      await expect(page).toHaveURL("/cart");
      await expect(page.getByRole("heading", { name: "Book Bag" })).toBeVisible();
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

  test(
    "shows duplicate email errors during registration",
    { tag: "@a1" },
    async ({ page }) => {
      const email = uniqueCustomerEmail();

      const response = await page.request.post("/api/auth/register", {
        data: {
          name: "Existing Customer",
          email,
          password: "password123",
        },
      });
      expect(response.status()).toBe(201);

      await page.goto("/auth");
      await page.getByRole("button", { name: "Register" }).click();
      await page.getByLabel("Name").fill("Duplicate Customer");
      await page.getByLabel("Email").fill(email);
      await page.getByLabel("Password", { exact: true }).fill("password123");
      await page.getByLabel("Repeat password").fill("password123");
      await page.getByRole("button", { name: "Create account" }).click();

      await expect(
        page.getByText("An account with this email already exists."),
      ).toBeVisible();
    },
  );
});
