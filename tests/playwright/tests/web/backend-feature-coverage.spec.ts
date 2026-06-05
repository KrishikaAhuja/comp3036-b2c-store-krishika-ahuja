import { client } from "@repo/db/client";
import { seed } from "@repo/db/seed";
import { expect, test, type APIRequestContext } from "./fixtures";

function uniqueEmail() {
  return `backend-coverage-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;
}

async function registerCustomer(request: APIRequestContext, email = uniqueEmail()) {
  const response = await request.post("/api/auth/register", {
    data: {
      name: "Backend Customer",
      email,
      password: "password123",
    },
  });
  expect(response.status()).toBe(201);

  return email;
}

async function loginCustomer(request: APIRequestContext, email: string) {
  const response = await request.post("/api/auth/login", {
    data: {
      email,
      password: "password123",
    },
  });
  expect(response.status()).toBe(200);
}

async function getCheckoutProduct() {
  return client.db.post.findFirstOrThrow({
    where: {
      active: true,
      stockQuantity: {
        gte: 3,
      },
    },
    orderBy: {
      id: "asc",
    },
  });
}

function checkoutBody(productId: number, overrides = {}) {
  return {
    items: [
      {
        id: productId,
        quantity: 1,
      },
    ],
    customer: {
      fullName: "Backend Customer",
      email: "backend@example.com",
      phone: "0412 345 678",
      deliveryAddress: "12 Book Lane, Sydney, NSW, 2000",
    },
    payment: {
      method: "pay_on_delivery",
    },
    ...overrides,
  };
}

test.beforeEach(async ({ request }) => {
  await seed();
  await request.post("/api/auth/logout");
});

test.describe("backend customer feature coverage", () => {
  test("current customer API rejects missing sessions", { tag: "@a3" }, async ({
    request,
  }) => {
    const response = await request.get("/api/auth/me");

    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ user: null });
  });

  test("current customer API returns the signed-in customer", { tag: "@a3" }, async ({
    request,
  }) => {
    const email = await registerCustomer(request);
    await loginCustomer(request, email);

    const response = await request.get("/api/auth/me");
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.user).toMatchObject({
      email,
      name: "Backend Customer",
      role: "CUSTOMER",
    });
  });

  test("customer logout invalidates the current user API", { tag: "@a3" }, async ({
    request,
  }) => {
    const email = await registerCustomer(request);
    await loginCustomer(request, email);

    const logoutResponse = await request.post("/api/auth/logout");
    const meResponse = await request.get("/api/auth/me");

    expect(logoutResponse.status()).toBe(200);
    expect(meResponse.status()).toBe(401);
  });

  test("registration does not issue a customer session cookie", { tag: "@a3" }, async ({
    request,
  }) => {
    const response = await request.post("/api/auth/register", {
      data: {
        name: "Manual Login Customer",
        email: uniqueEmail(),
        password: "password123",
      },
    });

    expect(response.status()).toBe(201);
    expect(response.headers()["set-cookie"] ?? "").not.toContain("customer_auth_token");
  });

  test("checkout API rejects invalid phone numbers", { tag: "@a3" }, async ({
    request,
  }) => {
    const email = await registerCustomer(request);
    await loginCustomer(request, email);
    const product = await getCheckoutProduct();

    const response = await request.post("/api/checkout", {
      data: checkoutBody(product.id, {
        customer: {
          fullName: "Backend Customer",
          email,
          phone: "12345",
          deliveryAddress: "12 Book Lane, Sydney, NSW, 2000",
        },
      }),
    });

    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({
      error: "Enter any 10 digits for the phone number.",
    });
  });

  test("checkout API rejects empty delivery addresses", { tag: "@a3" }, async ({
    request,
  }) => {
    const email = await registerCustomer(request);
    await loginCustomer(request, email);
    const product = await getCheckoutProduct();

    const response = await request.post("/api/checkout", {
      data: checkoutBody(product.id, {
        customer: {
          fullName: "Backend Customer",
          email,
          phone: "0412 345 678",
          deliveryAddress: "",
        },
      }),
    });

    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({
      error: "Delivery address is required.",
    });
  });

  test("checkout API rejects invalid card characters", { tag: "@a3" }, async ({
    request,
  }) => {
    const email = await registerCustomer(request);
    await loginCustomer(request, email);
    const product = await getCheckoutProduct();

    const response = await request.post("/api/checkout", {
      data: checkoutBody(product.id, {
        payment: {
          method: "mock_credit_card",
          cardholderName: "Backend Customer",
          cardNumber: "1234-5678-9012-3456",
          expiryDate: "12/28",
          cvv: "123",
        },
      }),
    });

    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({
      error: "Card number can only contain numbers and spaces.",
    });
  });

  test("pay on delivery checkout creates a not paid order", { tag: "@a3" }, async ({
    request,
  }) => {
    const email = await registerCustomer(request);
    await loginCustomer(request, email);
    const product = await getCheckoutProduct();

    const response = await request.post("/api/checkout", {
      data: checkoutBody(product.id),
    });

    expect(response.status()).toBe(200);
    const order = await client.db.order.findFirstOrThrow({
      where: {
        user: {
          email,
        },
      },
      orderBy: {
        id: "desc",
      },
    });
    expect(order.status).toBe("NOT_PAID");
    expect(order.paymentProvider).toBe("pay_on_delivery");
  });

  test("card checkout creates a paid mock card order", { tag: "@a3" }, async ({
    request,
  }) => {
    const email = await registerCustomer(request);
    await loginCustomer(request, email);
    const product = await getCheckoutProduct();

    const response = await request.post("/api/checkout", {
      data: checkoutBody(product.id, {
        payment: {
          method: "mock_credit_card",
          cardholderName: "Backend Customer",
          cardNumber: "1234 5678 9012 3456",
          expiryDate: "12/28",
          cvv: "123",
        },
      }),
    });

    expect(response.status()).toBe(200);
    const order = await client.db.order.findFirstOrThrow({
      where: {
        user: {
          email,
        },
      },
      orderBy: {
        id: "desc",
      },
    });
    expect(order.status).toBe("PAID");
    expect(order.paymentProvider).toBe("mock_credit_card");
  });

  test("checkout decrements purchased book stock", { tag: "@a3" }, async ({ request }) => {
    const email = await registerCustomer(request);
    await loginCustomer(request, email);
    const product = await getCheckoutProduct();

    const response = await request.post("/api/checkout", {
      data: checkoutBody(product.id, {
        items: [
          {
            id: product.id,
            quantity: 2,
          },
        ],
      }),
    });

    expect(response.status()).toBe(200);
    const updated = await client.db.post.findUniqueOrThrow({
      where: {
        id: product.id,
      },
      select: {
        stockQuantity: true,
      },
    });
    expect(updated.stockQuantity).toBe(product.stockQuantity - 2);
  });
});
