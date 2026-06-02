import { expect, test } from "./fixtures";

test.describe("ADMIN AUTH", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test(
    "rejects incorrect admin credentials",
    { tag: "@a2" },
    async ({ page }) => {
      await page.goto("/");

      await page.getByLabel("Email", { exact: true }).fill("admin@example.com");
      await page.getByLabel("Password", { exact: true }).fill("wrongpass");
      await page.getByRole("button", { name: "Sign In" }).click();

      await expect(
        page.getByText("Incorrect email or password. Please try again."),
      ).toBeVisible();
    },
  );

  test(
    "logs in and logs out an admin",
    { tag: "@a2" },
    async ({ page }) => {
      await page.goto("/");

      await page.getByLabel("Email", { exact: true }).fill("admin@example.com");
      await page.getByLabel("Password", { exact: true }).fill("123");
      await page.getByRole("button", { name: "Sign In" }).click();

      await expect(page.getByText("Product Management")).toBeVisible();

      const cookies = await page.context().cookies();
      expect(cookies.some((cookie) => cookie.name === "admin_auth_token")).toBe(
        true,
      );

      await page.getByRole("button", { name: "Logout" }).click();

      await expect(page.getByText("Sign in to your account")).toBeVisible();
    },
  );

  test(
    "requires admin login for create product page",
    { tag: "@a2" },
    async ({ page }) => {
      await page.goto("/posts/create");

      await expect(page.getByText("Sign in to your account")).toBeVisible();
      await expect(page.getByLabel("Email", { exact: true })).toBeVisible();
      await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
    },
  );

  test(
    "ignores customer auth cookies in admin app",
    { tag: "@a2" },
    async ({ page, context }) => {
      await context.addCookies([
        {
          name: "customer_auth_token",
          value: "not-an-admin-token",
          url: "http://localhost:3002",
        },
      ]);

      await page.goto("/");

      await expect(page.getByText("Sign in to your account")).toBeVisible();
      await expect(page.getByText("Product Management")).not.toBeVisible();
    },
  );

  test(
    "blocks unauthenticated admin API access",
    { tag: "@a3" },
    async ({ request }) => {
      const listResponse = await request.get("/api/posts");
      expect(listResponse.status()).toBe(401);

      const createResponse = await request.post("/api/posts", {
        data: {
          title: "Unauthorized Product",
          description: "Should not be created",
          content: "Blocked",
          tags: "blocked",
          imageUrl: "https://example.com/image.jpg",
          category: "Security",
          priceAud: 1,
          stockQuantity: 1,
          active: true,
        },
      });

      expect(createResponse.status()).toBe(401);
    },
  );

  test(
    "blocks admin API access after logout",
    { tag: "@a3" },
    async ({ request }) => {
      const loginResponse = await request.post("/api/auth", {
        data: {
          email: "admin@example.com",
          password: "123",
        },
        maxRedirects: 0,
      });

      expect(loginResponse.status()).toBe(303);

      const loggedInResponse = await request.get("/api/posts");
      expect(loggedInResponse.status()).toBe(200);

      const logoutResponse = await request.delete("/api/auth");
      expect(logoutResponse.status()).toBe(200);

      const loggedOutResponse = await request.get("/api/posts");
      expect(loggedOutResponse.status()).toBe(401);
    },
  );

  test(
    "allows authenticated admin API access",
    { tag: "@a3" },
    async ({ request }) => {
      const loginResponse = await request.post("/api/auth", {
        data: {
          email: "admin@example.com",
          password: "123",
        },
        maxRedirects: 0,
      });

      expect(loginResponse.status()).toBe(303);
      expect(loginResponse.headers()["set-cookie"]).toContain("admin_auth_token");

      const postsResponse = await request.get("/api/posts");
      expect(postsResponse.status()).toBe(200);
    },
  );
});
