import { describe, expect, test } from "vitest";
import { getCustomerLoginUrl, getSafeNextPath } from "./customerAuthRedirect";

describe("customer auth redirects", () => {
  test("keeps local paths as valid post-login destinations", () => {
    expect(getSafeNextPath("/cart")).toBe("/cart");
    expect(getSafeNextPath("/post/test-laptop?from=cart")).toBe(
      "/post/test-laptop?from=cart",
    );
  });

  test("falls back to home for missing or external destinations", () => {
    expect(getSafeNextPath()).toBe("/");
    expect(getSafeNextPath("https://example.com")).toBe("/");
    expect(getSafeNextPath("//example.com")).toBe("/");
  });

  test("builds encoded customer login URLs", () => {
    expect(getCustomerLoginUrl("/post/test laptop?ref=cart")).toBe(
      "/auth?next=%2Fpost%2Ftest%20laptop%3Fref%3Dcart",
    );
  });
});
