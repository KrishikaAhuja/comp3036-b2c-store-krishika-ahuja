import type { PropsWithChildren } from "react";

export function LinkList(props: PropsWithChildren<{ title: string }>) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
        {props.title}
      </h2>
      <ul className="space-y-2">{props.children}</ul>
    </div>
  );
}