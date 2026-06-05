import { getHistoryRangeSlug, history } from "@/functions/history";
import { type Post } from "@repo/db/data";
import { SummaryItem } from "./SummaryItem";
import { LinkList } from "./LinkList";

export async function HistoryList({
  selectedRange,
  posts,
  preview = false,
}: {
  selectedRange?: string;
  posts: Post[];
  preview?: boolean;
}) {
  // Build arrival archive links from product dates, newest range first.
  const historyItems = history(posts);

  return (
    <LinkList title="Arrivals">
      {historyItems.map((item) => {
        const slug = getHistoryRangeSlug(item.startYear, item.endYear);

        return (
          <SummaryItem
            key={slug}
            name={slug}
            count={item.count}
            isSelected={selectedRange === slug}
            link={`/history/${slug}${preview ? "?preview=admin" : ""}`}
            title={`Arrivals / ${slug}`}
          />
        );
      })}
    </LinkList>
  );
}
