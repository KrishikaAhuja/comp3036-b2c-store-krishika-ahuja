import { client } from "@repo/db/client";
import { redirect } from "next/navigation";
import { isLoggedIn } from "../../utils/auth";
import { AdminShell } from "../AdminShell";
import { getAdminShellStats } from "../adminData";
import styles from "../admin-list.module.css";

export default async function CustomersPage() {
  const loggedIn = await isLoggedIn();

  if (!loggedIn) {
    redirect("/");
  }

  const [users, shellStats] = await Promise.all([
    client.db.user.findMany({
      where: {
        role: "CUSTOMER",
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }),
    getAdminShellStats(),
  ]);

  return (
    <AdminShell active="customers" {...shellStats}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Accounts</p>
          <h1 className={styles.title}>Customers</h1>
        </div>
      </header>

      <section className={styles.statsGrid} aria-label="Customer overview">
        <div className={styles.statCard}>
          <span>Registered Readers</span>
          <strong>{users.length}</strong>
          <small>Customer accounts</small>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <p className={styles.eyebrow}>Directory</p>
            <h2>Account List</h2>
          </div>
          <p className={styles.resultsText}>{users.length} customer account{users.length === 1 ? "" : "s"}</p>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.inventoryTable}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
