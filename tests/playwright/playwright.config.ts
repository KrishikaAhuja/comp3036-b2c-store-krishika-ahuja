import { defineConfig, devices } from "@playwright/test";
import "dotenv/config";
/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

import path from "path";

const repoRoot = path.resolve(__dirname, "../..");
const webPort = process.env.E2E_WEB_PORT ?? "3101";
const adminPort = process.env.E2E_ADMIN_PORT ?? "3102";
const webUrl = `http://localhost:${webPort}`;
const adminUrl = `http://localhost:${adminPort}`;
const testDatabaseUrl = `file:${path
  .resolve(repoRoot, "packages/db/prisma/test.db")
  .replace(/\\/g, "/")}`;

process.chdir(repoRoot);
process.env.DATABASE_URL = testDatabaseUrl;
process.env.JWT_SECRET ??= "secret";
process.env.E2E_WEB_URL = webUrl;
process.env.E2E_ADMIN_URL = adminUrl;
process.env.CUSTOMER_SITE_URL = webUrl;
process.env.NEXT_PUBLIC_ADMIN_URL = adminUrl;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests",
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : 1,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [["list"]], // process.env.CI ? [["list"]] : [["list"], ["html"]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: adminUrl,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",

    /* I use custom test id attribute */
    testIdAttribute: "data-test-id",

    /* Screenshot only on failure */
    screenshot: "only-on-failure",

    /* Video only on failure */
    // video: "retain-on-failure",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      testDir: "./tests/admin",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: adminUrl,
      },
    },
    {
      name: "chromium",
      testDir: "./tests/web",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: webUrl,
      },
    },

    // {
    //   name: "firefox",
    //   use: { ...devices["Desktop Firefox"] },
    //   dependencies: process.env.CI ? ["setup"] : [],
    // },

    // {
    //   name: "webkit",
    //   use: { ...devices["Desktop Safari"] },
    //   dependencies: process.env.CI ? ["setup"] : [],
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: [
    {
      reuseExistingServer: false,
      command: process.env.CI
        ? `pnpm --filter @repo/db db:push:skip-generate && pnpm --filter admin start -- -p ${adminPort}`
        : `pnpm --filter @repo/db db:push:skip-generate && pnpm --filter admin exec next dev --turbopack -p ${adminPort}`,
      url: adminUrl,
      timeout: 120_000,
    },
    {
      reuseExistingServer: false,
      command: process.env.CI
        ? `pnpm --filter web start -- -p ${webPort}`
        : `pnpm --filter web exec next dev --turbopack -p ${webPort}`,
      url: webUrl,
      timeout: 120_000,
    },
  ],
});
