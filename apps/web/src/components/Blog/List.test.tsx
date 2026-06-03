import type { Post } from "@repo/db/data";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { BlogList } from "./List";

export const post1: Post = {
  title: "The Test Mystery",
  date: new Date("01 Oct 2024"),
  tags: "Adult",
  category: "Mystery",
  content: "Content of The Test Mystery",
  description: "A suspense novel with a sharp final reveal",
  id: 1,
  imageUrl: "https://example.com/image.jpg",
  likes: 30,
  priceAud: 24,
  stockQuantity: 12,
  active: true,
  urlId: "the-test-mystery",
  views: 200,
};

export const post2: Post = {
  title: "The Test Romance",
  date: new Date("01 May 2022"),
  tags: "Adult",
  category: "Romance",
  content: "Content of The Test Romance",
  description: "A contemporary romance with charming banter",
  id: 2,
  imageUrl: "https://example.com/image.jpg",
  likes: 550,
  priceAud: 22,
  stockQuantity: 20,
  active: true,
  urlId: "the-test-romance",
  views: 1000,
};

test("renders 0 posts when no posts are present", async () => {
  const { getByText } = render(<BlogList posts={[]} />);
  await expect.element(getByText("0 Books")).toBeInTheDocument();
});

test("renders all posts", async () => {
  const component = render(<BlogList posts={[post1, post2]} />);

  await expect(
    component.baseElement.getElementsByTagName("article"),
  ).toHaveLength(2);
  await expect
    .element(component.getByText("The Test Mystery"))
    .toBeInTheDocument();
  await expect
    .element(component.getByText("The Test Romance"))
    .toBeInTheDocument();
});
