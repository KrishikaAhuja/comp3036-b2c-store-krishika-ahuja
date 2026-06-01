import { expect, test } from "./fixtures";

function uniqueCustomerEmail() {
  return `api-customer-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;
}

test.describe("CUSTOMER AUTH API", () => {
  test(
    "rejects invalid registration data",
    { tag: "@a3" },
    async ({ request }) => {
      const response = await request.post("/api/auth/register", {
        data: {
          name: "Short Password",
          email: uniqueCustomerEmail(),
          password: "short",
        },
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.error).toBe("Password must be at least 8 characters.");
    },
  );

  test(
    "registers, logs in, returns current user, and logs out",
    { tag: "@a3" },
    async ({ request }) => {
      const email = uniqueCustomerEmail();
      const password = "password123";

      const registerResponse = await request.post("/api/auth/register", {
        data: {
          name: "API Customer",
          email,
          password,
        },
      });

      expect(registerResponse.status()).toBe(201);

      const loginResponse = await request.post("/api/auth/login", {
        data: {
          email,
          password,
        },
      });

      expect(loginResponse.status()).toBe(200);
      expect(loginResponse.headers()["set-cookie"]).toContain(
        "customer_auth_token",
      );

      const meResponse = await request.get("/api/auth/me");
      expect(meResponse.status()).toBe(200);

      const meBody = await meResponse.json();
      expect(meBody.user).toMatchObject({
        email,
        role: "CUSTOMER",
      });

      const logoutResponse = await request.post("/api/auth/logout");
      expect(logoutResponse.status()).toBe(200);
      expect(logoutResponse.headers()["set-cookie"]).toContain(
        "customer_auth_token=;",
      );
    },
  );

  test(
    "rejects duplicate customer emails",
    { tag: "@a3" },
    async ({ request }) => {
      const email = uniqueCustomerEmail();

      await request.post("/api/auth/register", {
        data: {
          name: "First Customer",
          email,
          password: "password123",
        },
      });

      const duplicateResponse = await request.post("/api/auth/register", {
        data: {
          name: "Duplicate Customer",
          email,
          password: "password123",
        },
      });

      expect(duplicateResponse.status()).toBe(409);
      const body = await duplicateResponse.json();
      expect(body.error).toBe("An account with this email already exists.");
    },
  );
});
