import { client } from "@repo/db/client";
import { redirect } from "next/navigation";
import { isLoggedIn } from "../../utils/auth";
import { AdminShell } from "../AdminShell";
import { getAdminShellStats } from "../adminData";
import styles from "../admin-list.module.css";
import { InventoryTable } from "./InventoryTable";

export default async function InventoryPage() {
  const loggedIn = await isLoggedIn();

  if (!loggedIn) {
    redirect("/");
  }

  const [posts, shellStats] = await Promise.all([
    client.db.post.findMany({
      orderBy: {
        date: "desc",
      },
    }),
    getAdminShellStats(),
  ]);

  return (
    <AdminShell active="inventory" {...shellStats}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Products</p>
          <h1 className={styles.title}>Inventory</h1>
        </div>
        <a href="/posts/create" className={styles.createButton}>
          Add Book
        </a>
      </header>

      <InventoryTable posts={posts} />
    </AdminShell>
  );
}
