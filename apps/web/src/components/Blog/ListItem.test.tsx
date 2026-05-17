import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { post1 } from "./List.test";
import { BlogListItem } from "./ListItem";

test("renders product card data", async () => {
  const { getByText } = render(<BlogListItem post={post1} />);

  await expect.element(getByText("Test Laptop")).toBeVisible();
  await expect
    .element(getByText("Test Laptop"))
    .toHaveAttribute("href", "/post/test-laptop");
  await expect.element(getByText("Electronics")).toBeVisible();
  await expect.element(getByText("#Laptops")).toBeVisible();
  await expect.element(getByText("#Productivity")).toBeVisible();
  await expect.element(getByText("01 Oct 2024")).toBeVisible();
  await expect.element(getByText("$1,299")).toBeVisible();
  await expect.element(getByText("12 in stock")).toBeVisible();
  await expect.element(getByText("30 watching stock")).toBeVisible();
  await expect.element(getByText("Add to Cart")).toBeVisible();
  await expect.element(getByText("View Product")).toBeVisible();
});
