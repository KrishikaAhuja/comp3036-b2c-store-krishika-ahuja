import type { PropsWithChildren } from "react";

export function Content({ children }: PropsWithChildren) {
  return <div className="min-w-0 flex-1">{children}</div>;
}