import { test as setup } from "@playwright/test";

setup(
  "authenticate assignment 3",
  { tag: "@a3" },
  async ({ playwright }) => {
    const authFile = ".auth/user.json";

    const apiContext = await playwright.request.newContext();

    await apiContext.post("http://localhost:3002/api/auth", {
      data: { password: "123" },
    });

    await apiContext.storageState({ path: authFile });
  },
);