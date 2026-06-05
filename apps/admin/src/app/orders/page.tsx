import { redirect } from "next/navigation";
import { isLoggedIn } from "../../utils/auth";
import { AdminShell } from "../AdminShell";
import { getAdminShellStats, getRecentOrders } from "../adminData";
import styles from "../admin-list.module.css";

export const dynamic = "force-dynamic";

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

function formatPaymentStatus(status: string) {
  return status === "PAID" ? "Paid" : "Not paid";
}

export default async function OrdersPage() {
  const loggedIn = await isLoggedIn();

  if (!loggedIn) {
    redirect("/");
  }

  const [shellStats, orders] = await Promise.all([
    getAdminShellStats(),
    getRecentOrders(25),
  ]);

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
          <h2>Recent checkout orders</h2>
        </div>
        {orders.length === 0 ? (
          <div className={styles.placeholderBlock}>
            <strong>No orders yet</strong>
            <span>Completed mock payment checkouts will appear here.</span>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.inventoryTable}>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Transaction</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>
                      <strong>{order.customerName}</strong>
                      <br />
                      <small>{order.customerEmail}</small>
                    </td>
                    <td>
                      {order.itemCount} item{order.itemCount === 1 ? "" : "s"}
                    </td>
                    <td>{formatPrice(order.totalAud)}</td>
                    <td>
                      <span
                        className={
                          order.status === "PAID"
                            ? styles.readyBadge
                            : styles.lowBadge
                        }
                      >
                        {formatPaymentStatus(order.status)}
                      </span>
                    </td>
                    <td>{order.paymentReference || "Not recorded"}</td>
                    <td>{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AdminShell>
  );
}
