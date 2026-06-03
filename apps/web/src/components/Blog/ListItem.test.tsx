import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { post1 } from "./List.test";
import { BlogListItem } from "./ListItem";

test("renders book card data", async () => {
  const { getByLabelText, getByText } = render(<BlogListItem post={post1} />);

  await expect
    .element(getByLabelText("Flip The Test Mystery to details"))
    .toBeVisible();
  await getByLabelText("Flip The Test Mystery to details").click();

  await expect
    .element(getByText("The Test Mystery"))
    .toHaveAttribute("href", "/post/the-test-mystery");
  await expect.element(getByText("Mystery", { exact: true })).toBeVisible();
  await expect.element(getByText("#Adult")).toBeVisible();
  await expect.element(getByText("01 Oct 2024")).toBeVisible();
  await expect.element(getByText("$24")).toBeVisible();
  await expect.element(getByText("12 copies left")).toBeVisible();
  await expect.element(getByText("30 saving this read")).toBeVisible();
  await expect.element(getByText("Add to Book Bag")).toBeVisible();
  await expect.element(getByText("View Book")).toBeVisible();
});
