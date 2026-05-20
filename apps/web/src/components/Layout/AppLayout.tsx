import type { PropsWithChildren } from "react";
import { Content } from "../Content";
import { LeftMenu } from "../Menu/LeftMenu";
import { TopMenu } from "./TopMenu";
import { getActiveProducts } from "@/functions/products";

export async function AppLayout({
  children,
  query,
}: PropsWithChildren<{ query?: string }>) {
  // The sidebar needs the current active catalogue for category, arrival, and collection counts.
  const posts = await getActiveProducts();

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          <LeftMenu posts={posts} />
          <Content>
            <TopMenu query={query} />
            {children}
          </Content>
        </div>
      </div>
    </div>
  );
}
