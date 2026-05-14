import { defineConfig, devices } from "@playwright/test";
import "dotenv/config";
/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

import fs from "fs";
import path from "path";

// Define the directory path
const authDir = path.resolve(".auth");

// Create .auth directory if it doesn't exist
if (!fs.existsSync(authDir)) {
  fs.mkdirSync(authDir);
  console.log(".auth directory created");
}

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
    baseURL: "http://localhost:3002",

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
    { name: "setup", testMatch: /.*\.setup\.ts/ },
    {
      name: "chromium",
      testDir: "./tests/admin",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "http://localhost:3002",
      },
      dependencies: process.env.CI ? ["setup"] : [],
    },
    {
      name: "chromium",
      testDir: "./tests/web",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "http://localhost:3001",
      },
      dependencies: process.env.CI ? ["setup"] : [],
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
  webServer: process.env.CI
    ? [
        {
          reuseExistingServer: true,
          command: "pnpm start:admin",
          url: "http://localhost:3002",
          // reuseExistingServer: !process.env.CI,
        },
        {
          reuseExistingServer: true,
          command: "pnpm start:web",
          url: "http://localhost:3001",
          // reuseExistingServer: !process.env.CI,
        },
      ]
    : undefined,
});
