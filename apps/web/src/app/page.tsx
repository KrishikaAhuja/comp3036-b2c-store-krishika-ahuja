import { AppLayout } from "../components/Layout/AppLayout";
import { Main } from "../components/Main";
import { getActiveProducts } from "@/functions/products";
import styles from "./page.module.css";
export const dynamic = "force-dynamic";

export default async function Home() {
  const posts = await getActiveProducts();

  return (
    <AppLayout>
      <Main posts={posts} className={styles.main} />
    </AppLayout>
  );
}
