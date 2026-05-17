import type { Post } from "@repo/db/data";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { BlogList } from "./List";

export const post1: Post = {
  title: "Test Laptop",
  date: new Date("01 Oct 2024"),
  tags: "Laptops,Productivity",
  category: "Electronics",
  content: "Content of Test Laptop",
  description: "Lightweight notebook for work and study",
  id: 1,
  imageUrl: "https://example.com/image.jpg",
  likes: 30,
  priceAud: 1299,
  stockQuantity: 12,
  active: true,
  urlId: "test-laptop",
  views: 200,
};

export const post2: Post = {
  title: "Test Headphones",
  date: new Date("01 May 2022"),
  tags: "Headphones,Wireless",
  category: "Audio",
  content: "Content of Test Headphones",
  description: "Wireless headphones with noise cancellation",
  id: 2,
  imageUrl: "https://example.com/image.jpg",
  likes: 550,
  priceAud: 349,
  stockQuantity: 20,
  active: true,
  urlId: "test-headphones",
  views: 1000,
};

test("renders 0 posts when no posts are present", async () => {
  const { getByText } = render(<BlogList posts={[]} />);
  await expect.element(getByText("0 Products")).toBeInTheDocument();
});

test("renders all posts", async () => {
  const component = render(<BlogList posts={[post1, post2]} />);

  await expect(
    component.baseElement.getElementsByTagName("article"),
  ).toHaveLength(2);
  await expect.element(component.getByText("Test Laptop")).toBeInTheDocument();
  await expect
    .element(component.getByText("Test Headphones"))
    .toBeInTheDocument();
});
