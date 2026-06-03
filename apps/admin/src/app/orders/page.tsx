import { redirect } from "next/navigation";
import { isLoggedIn } from "../../utils/auth";
import { AdminShell } from "../AdminShell";
import { getAdminShellStats } from "../adminData";
import styles from "../admin-list.module.css";

export default async function OrdersPage() {
  const loggedIn = await isLoggedIn();

  if (!loggedIn) {
    redirect("/");
  }

  const shellStats = await getAdminShellStats();

  return (
    <AdminShell active="orders" {...shellStats}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Fulfilment</p>
          <h1 className={styles.title}>Orders</h1>
        </div>
      </header>

      <section className={styles.panel}>
        <div className={styles.panelHeaderCompact}>
          <p className={styles.eyebrow}>Order Queue</p>
          <h2>Checkout history is not connected yet</h2>
        </div>
        <div className={styles.placeholderBlock}>
          <strong>Ready for the next data model</strong>
          <span>
            Your current database has books, likes, and users, but no Order
            table. This page is set up as the admin destination for orders once
            checkout persistence is added.
          </span>
        </div>
      </section>
    </AdminShell>
  );
}
