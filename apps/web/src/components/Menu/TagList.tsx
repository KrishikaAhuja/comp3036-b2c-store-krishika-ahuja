import type { Post } from "@repo/db/data";
import { tags } from "../../functions/tags";
import { LinkList } from "./LinkList";
import { SummaryItem } from "./SummaryItem";

export async function TagList({
  selectedTag,
  posts,
}: {
  selectedTag?: string;
  posts: Post[];
}) {
  // Tags are used as customer-facing age ranges in the sidebar.
  const postTags = (await tags(posts)) as {
    name: string;
    count: number;
  }[];

  return (
    <LinkList title="Age Range">
      {postTags.map((item) => (
        <SummaryItem
          key={item.name}
          name={item.name}
          count={item.count}
          isSelected={selectedTag === item.name}
          link={`/tags/${item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`}
          title={`Age Range / ${item.name}`}
        />
      ))}
    </LinkList>
  );
}
