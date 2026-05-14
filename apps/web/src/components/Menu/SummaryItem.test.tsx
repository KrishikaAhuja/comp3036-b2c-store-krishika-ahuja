import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { SummaryItem } from "./SummaryItem";

test("renders non-selected summary item with count", async () => {
  const { getByText } = render(
    <SummaryItem
      count={10}
      isSelected={false}
      link="/my/link"
      name="Link to Content"
      title="Content Title"
    />,
  );
  await expect.element(getByText("10")).toBeInTheDocument();
  await expect.element(getByText("Link to Content")).toBeInTheDocument();
  await expect
    .element(getByText("Link to Content").element().parentElement!)
    .toHaveAttribute("href", "/my/link");

  await expect
    .element(getByText("Link to Content").element().parentElement!)
    .not.toHaveClass("selected");
});

test("renders selected summary item with count", async () => {
  const { getByText } = render(
    <SummaryItem
      count={10}
      isSelected={true}
      link="/my/link"
      name="Link to Content"
      title="Content Title"
    />,
  );

  await expect
    .element(getByText("Link to Content").element().parentElement!)
    .toHaveClass("selected");
});
