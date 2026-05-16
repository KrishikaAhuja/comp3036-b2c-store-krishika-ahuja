import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { post1 } from "./List.test";
import { BlogListItem } from "./ListItem";

test("renders product card data", async () => {
  const { getByText } = render(<BlogListItem post={post1} />);

  await expect.element(getByText("Hello, World")).toBeVisible();
  await expect
    .element(getByText("Hello, World"))
    .toHaveAttribute("href", "/post/hello-world");
  await expect.element(getByText("Cat")).toBeVisible();
  await expect.element(getByText("#Hello")).toBeVisible();
  await expect.element(getByText("#World")).toBeVisible();
  await expect.element(getByText("01 Oct 2024")).toBeVisible();
  await expect.element(getByText("30 in stock")).toBeVisible();
  await expect.element(getByText("30 watching stock")).toBeVisible();
  await expect.element(getByText("Add to Cart")).toBeVisible();
  await expect.element(getByText("View Product")).toBeVisible();
});
