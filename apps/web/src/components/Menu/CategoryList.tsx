import { categories } from "@/functions/categories";
import type { Post } from "@repo/db/data";
import { SummaryItem } from "./SummaryItem";
import { LinkList } from "./LinkList";

export function CategoryList({ posts }: { posts: Post[] }) {
  const baseCategories = categories(posts);

  // Keep the main store departments visible even when a category currently has no products.
  const ALL_CATEGORIES = [
    "Mystery",
    "Romance",
    "Fantasy",
    "Children",
    "Nonfiction",
  ];

  // Merge live counts into the fixed department list shown in the sidebar.
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
