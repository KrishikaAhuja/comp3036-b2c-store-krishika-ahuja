import type { Post } from "@repo/db/data";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { BlogList } from "./List";

export const post1: Post = {
  title: "Hello, World!",
  date: new Date("01 Oct 2024"),
  tags: "Hello,World",
  category: "Cat",
  content: "Content of Hello World",
  description: "Description of Hello World",
  id: 1,
  imageUrl: "https://example.com/image.jpg",
  likes: 30,
  active: true,
  urlId: "hello-world",
  views: 200,
};

export const post2: Post = {
  title: "Hola, Mundo!",
  date: new Date("01 May 2022"),
  tags: "Hola,Mundo",
  category: "Kat",
  content: "Contento del Hola Mundo",
  description: "Descripcion de Hola Mundo",
  id: 2,
  imageUrl: "https://example.com/image.jpg",
  likes: 550,
  active: true,
  urlId: "hola-mundo",
  views: 1000,
};

test("renders 0 posts when no posts are present", async () => {
  const { getByText } = render(<BlogList posts={[]} />);
  await expect.element(getByText("0 Posts")).toBeInTheDocument();
});

test("renders all posts", async () => {
  const component = render(<BlogList posts={[post1, post2]} />);

  await expect(
    component.baseElement.getElementsByTagName("article"),
  ).toHaveLength(2);
  await expect.element(component.getByText("Hello World")).toBeInTheDocument();
  await expect.element(component.getByText("Hola Mundo")).toBeInTheDocument();
});
