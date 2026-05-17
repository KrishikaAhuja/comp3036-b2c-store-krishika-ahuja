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
  const postTags = (await tags(posts)) as {
    name: string;
    count: number;
  }[];

  return (
    <LinkList title="Collections">
      {postTags.map((item) => (
        <SummaryItem
          key={item.name}
          name={item.name}
          count={item.count}
          isSelected={selectedTag === item.name}
          link={`/tags/${item.name.toLowerCase().replaceAll(" ", "-")}`}
          title={`Collection / ${item.name}`}
        />
      ))}
    </LinkList>
  );
}
