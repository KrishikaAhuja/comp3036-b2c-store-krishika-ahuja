import { AppLayout } from "../components/Layout/AppLayout";
import { Main } from "../components/Main";
import { getActiveProducts } from "@/functions/products";
import styles from "./page.module.css";
export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ preview?: string }>;
}) {
  const params = await searchParams;
  const preview = params?.preview === "admin";
  // Load fresh active products so admin visibility changes are reflected immediately.
  const posts = await getActiveProducts();

  return (
    <AppLayout preview={preview}>
      <Main posts={posts} className={styles.main} readOnly={preview} />
    </AppLayout>
  );
}
