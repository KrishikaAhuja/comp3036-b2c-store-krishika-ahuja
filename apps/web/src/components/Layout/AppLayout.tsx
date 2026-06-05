import type { PropsWithChildren } from "react";
import { Content } from "../Content";
import { LeftMenu } from "../Menu/LeftMenu";
import { TopMenu } from "./TopMenu";
import { getActiveProducts } from "@/functions/products";
import { getCurrentUser } from "@/utils/auth";

export async function AppLayout({
  children,
  query,
  preview = false,
}: PropsWithChildren<{ query?: string; preview?: boolean }>) {
  // The sidebar needs the current active catalogue for genre, arrival, and age-range counts.
  const posts = await getActiveProducts();
  const user = preview ? null : await getCurrentUser();

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div
          className={
            preview
              ? "flex flex-col gap-8 md:flex-row"
              : "flex flex-col gap-8 lg:flex-row"
          }
        >
          <LeftMenu posts={posts} preview={preview} />
          <Content>
            <TopMenu query={query} userName={user?.name} preview={preview} />
            {children}
          </Content>
        </div>
      </div>
    </div>
  );
}
