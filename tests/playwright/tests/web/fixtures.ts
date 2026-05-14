import "dotenv/config";

import { type BrowserContext } from "@playwright/test";
// TODO: Implement seed
export async function seedData(...options: any[]) {
  /* After assignment two, move the hard coded data to the seed */
}

type AppOptions = {};

export function createOptions(options: Partial<AppOptions>) {
  return JSON.stringify({});
}

export async function setOptions(
  context: BrowserContext,
  options: Partial<AppOptions>,
) {
  await context.addCookies([
    {
      name: "options",
      url: process.env.VERCEL_URL,
      value: createOptions(options),
    },
  ]);
}

export * from "@playwright/test";
