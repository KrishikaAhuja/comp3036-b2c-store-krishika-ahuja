import { client } from "@repo/db/client";
import { seed } from "@repo/db/seed";
import { expect, test, type APIRequestContext } from "./fixtures";

async function loginAdmin(request: APIRequestContext) {
  const response = await request.post("/api/auth", {
    data: {
      email: "admin@example.com",
      password: "123",
    },
    maxRedirects: 0,
  });
  expect(response.status()).toBe(303);
}

function bookPayload(overrides = {}) {
  return {
    title: `API Coverage Book ${Date.now()}`,
    description: "Created through admin API coverage.",
    content: "# Book details\n\n**Author:** API Tester",
    imageUrl: "https://example.com/api-coverage.jpg",
    category: "Nonfiction",
    priceAud: 21,
    stockQuantity: 9,
    active: true,
    ...overrides,
  };
}

test.beforeEach(async ({ request }) => {
  await seed();
  await request.delete("/api/auth");
});

test.describe("backend admin feature coverage", () => {
  test("admin JSON login sets an admin auth cookie", { tag: "@a3" }, async ({
    request,
  }) => {
    const response = await request.post("/api/auth", {
      data: {
        email: "admin@example.com",
        password: "123",
      },
      maxRedirects: 0,
    });

    expect(response.status()).toBe(303);
    expect(response.headers()["set-cookie"]).toContain("admin_auth_token");
  });

  test("admin API creates a new book", { tag: "@a3" }, async ({ request }) => {
    await loginAdmin(request);

    const response = await request.post("/api/posts", {
      data: bookPayload(),
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body).toMatchObject({
      description: "Created through admin API coverage.",
      category: "Nonfiction",
      active: true,
    });
  });

  test("admin API creates url-safe book slugs", { tag: "@a3" }, async ({ request }) => {
    await loginAdmin(request);

    const response = await request.post("/api/posts", {
      data: bookPayload({
        title: "API Coverage: Symbols & Spaces!",
      }),
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.urlId).toBe("api-coverage-symbols-spaces");
  });

  test("admin API clamps invalid price and stock updates", { tag: "@a3" }, async ({
    request,
  }) => {
    await loginAdmin(request);

    const response = await request.put("/api/posts", {
      data: {
        id: 5,
        title: "Atomic Habits",
        description: "Updated through API coverage.",
        content: "# Book details\n\n**Author:** James Clear",
        imageUrl: "https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg",
        category: "Nonfiction",
        priceAud: -99,
        stockQuantity: -12,
        active: true,
      },
    });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.priceAud).toBe(0);
    expect(body.stockQuantity).toBe(0);
  });

  test("admin API toggles product visibility", { tag: "@a3" }, async ({ request }) => {
    await loginAdmin(request);

    const before = await client.db.post.findUniqueOrThrow({
      where: {
        id: 5,
      },
      select: {
        active: true,
      },
    });
    const response = await request.patch("/api/posts/5");
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.active).toBe(!before.active);
  });
});
