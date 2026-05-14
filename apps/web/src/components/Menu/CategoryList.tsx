import { categories } from "@/functions/categories";
import type { Post } from "@repo/db/data";
import { SummaryItem } from "./SummaryItem";
import { LinkList } from "./LinkList";

export function CategoryList({ posts }: { posts: Post[] }) {
  const baseCategories = categories(posts);

  const ALL_CATEGORIES = ["React", "Node", "Mongo", "DevOps"];

  const items = ALL_CATEGORIES.map((name) => {
    const existing = baseCategories.find((c) => c.name === name);
    return existing || { name, count: 0 };
  });

  return (
    <LinkList title="Categories">
      {items.map((item) => (
        <SummaryItem
          key={item.name}
          count={item.count}
          name={item.name}
          isSelected={false}
          link={`/category/${item.name.trim().toLowerCase().replaceAll(" ", "-")}`}
          title={`Category / ${item.name.trim()}`}
        />
      ))}
    </LinkList>
  );
}