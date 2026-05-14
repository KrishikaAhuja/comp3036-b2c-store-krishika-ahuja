import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { LinkList } from "./LinkList";

test("renders content with title", async () => {
  const { getByText } = render(
    <LinkList title={"My List"}>Hello World</LinkList>,
  );
  await expect.element(getByText("My List")).toBeInTheDocument();
  await expect.element(getByText("Hello World")).toBeInTheDocument();
});
