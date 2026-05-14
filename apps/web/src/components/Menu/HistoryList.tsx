import { history } from "@/functions/history";
import { type Post } from "@repo/db/data";
import { SummaryItem } from "./SummaryItem";
import { LinkList } from "./LinkList";

const months = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export async function HistoryList({
  selectedYear,
  selectedMonth,
  posts,
}: {
  selectedYear?: string;
  selectedMonth?: string;
  posts: Post[];
}) {
  const historyItems = history(posts);

  return (
    <LinkList title="History">
      {historyItems.map((item) => (
        <SummaryItem
          key={`${item.year}-${item.month}`}
          name={`${months[item.month]}, ${item.year}`}
          count={item.count}
          isSelected={
            selectedYear === String(item.year) &&
            selectedMonth === String(item.month)
          }
          link={`/history/${item.year}/${item.month}`}
          title={`History / ${months[item.month]}, ${item.year}`}
        />
      ))}
    </LinkList>
  );
}