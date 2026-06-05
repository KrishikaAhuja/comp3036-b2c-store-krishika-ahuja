import { AdminShell } from "./AdminShell";
import type { AdminOrderSummary } from "./adminData";
import styles from "./admin-list.module.css";

type AdminStats = {
  customerCount: number;
};

type AdminPost = {
  id: number;
  title: string;
  content: string;
  urlId: string;
  priceAud: number | null;
  stockQuantity: number | null;
  date: Date | string;
  active: boolean;
};

export default function AdminList({
  posts,
  stats,
  recentOrders,
}: {
  posts: AdminPost[];
  stats: AdminStats;
  recentOrders: AdminOrderSummary[];
}) {
  const totalStock = posts.reduce(
    (total, post) => total + (post.stockQuantity ?? 0),
    0,
  );
  const stockValue = posts.reduce(
    (total, post) => total + (post.priceAud ?? 0) * (post.stockQuantity ?? 0),
    0,
  );
  const outOfStockCount = posts.filter(
    (post) => (post.stockQuantity ?? 0) <= 0,
  ).length;
  const lowStockCount = posts.filter((post) => {
    const stock = post.stockQuantity ?? 0;
    return stock > 0 && stock <= 3;
  }).length;
  const activeBooks = posts.filter((post) => post.active).length;
  const inventoryAlerts = posts
    .filter((post) => (post.stockQuantity ?? 0) <= 3)
    .sort((a, b) => (a.stockQuantity ?? 0) - (b.stockQuantity ?? 0))
    .slice(0, 5);
  const recentlyAdded = [...posts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const stockValueAud = new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(stockValue);

  function formatPrice(value: number | null | undefined) {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      maximumFractionDigits: 0,
    }).format(value ?? 0);
  }

  function getAuthor(content: string) {
    return content.match(/\*\*Author:\*\*\s*([^\n]+)/)?.[1]?.trim() || "";
  }

  function formatDate(value: Date | string) {
    return new Intl.DateTimeFormat("en-AU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  }

  return (
    <AdminShell
      active="dashboard"
      activeBooks={activeBooks}
      outOfStockCount={outOfStockCount}
    >
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Operations overview</p>
          <h1 className={styles.title}>Admin Dashboard</h1>
        </div>

        <div className={styles.headerActions}>
          <a href="/preview" className={styles.secondaryButton}>
            Preview Customer Site
          </a>
          <a href="/posts/create" className={styles.createButton}>
            Add Book
          </a>
        </div>
      </header>

      <section className={styles.statsGrid} aria-label="Store overview">
        <div className={styles.statCard}>
          <span>Total Books</span>
          <strong>{posts.length}</strong>
          <small>{activeBooks} live in store</small>
        </div>
        <div className={styles.statCard}>
          <span>Stock Units</span>
          <strong>{totalStock}</strong>
          <small>{stockValueAud} inventory value</small>
        </div>
        <div className={styles.statCard}>
          <span>Customers</span>
          <strong>{stats.customerCount}</strong>
          <small>Registered reader accounts</small>
        </div>
        <div className={styles.statCardWarning}>
          <span>Stock Alerts</span>
          <strong>{outOfStockCount + lowStockCount}</strong>
          <small>Low or out of stock</small>
        </div>
      </section>

      <section className={styles.dashboardGrid} aria-label="Dashboard overview">
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.eyebrow}>Orders</p>
              <h2>Recent Orders</h2>
            </div>
            <a href="/orders" className={styles.textLink}>
              View all orders
            </a>
          </div>
          {recentOrders.length === 0 ? (
            <div className={styles.emptyDashboardState}>
              <strong>No orders yet</strong>
              <span>Completed checkouts will appear here.</span>
            </div>
          ) : (
            <div className={styles.dashboardList}>
              {recentOrders.map((order) => (
                <a
                  key={order.id}
                  href="/orders"
                  className={styles.dashboardListItem}
                >
                  <span>
                    <strong>Order #{order.id}</strong>
                    <small>
                      {order.customerName} · {order.itemCount} item
                      {order.itemCount === 1 ? "" : "s"} · {formatDate(order.createdAt)}
                    </small>
                  </span>
                  <em>{formatPrice(order.totalAud)}</em>
                </a>
              ))}
            </div>
          )}
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.eyebrow}>Stock</p>
              <h2>Inventory Alerts</h2>
            </div>
            <a href="/inventory" className={styles.textLink}>
              Manage inventory
            </a>
          </div>
          {inventoryAlerts.length === 0 ? (
            <div className={styles.emptyDashboardState}>
              <strong>No stock alerts</strong>
              <span>Every book currently has healthy stock.</span>
            </div>
          ) : (
            <div className={styles.dashboardList}>
              {inventoryAlerts.map((post) => {
                const stock = post.stockQuantity ?? 0;
                return (
                  <a
                    key={post.id}
                    href={`/post/${post.urlId}`}
                    className={styles.dashboardListItem}
                  >
                    <span>
                      <strong>{post.title}</strong>
                      <small>{stock} in stock</small>
                    </span>
                    <em className={stock <= 0 ? styles.outBadge : styles.lowBadge}>
                      {stock <= 0 ? "Out of stock" : "Low stock"}
                    </em>
                  </a>
                );
              })}
            </div>
          )}
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeaderCompact}>
            <p className={styles.eyebrow}>Sales</p>
            <h2>Best Selling Books</h2>
          </div>
          <div className={styles.emptyDashboardState}>
            <strong>No sales data yet</strong>
            <span>Top selling books will show here after order items are tracked.</span>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeaderCompact}>
            <p className={styles.eyebrow}>Catalog</p>
            <h2>Recently Added Books</h2>
          </div>
          {recentlyAdded.length === 0 ? (
            <div className={styles.emptyDashboardState}>
              <strong>No books yet</strong>
              <span>Add a book to start building the catalog.</span>
            </div>
          ) : (
            <div className={styles.dashboardList}>
              {recentlyAdded.map((post) => (
                <a
                  key={post.id}
                  href={`/post/${post.urlId}`}
                  className={styles.dashboardListItem}
                >
                  <span>
                    <strong>{post.title}</strong>
                    <small>{getAuthor(post.content) || "Author not set"}</small>
                  </span>
                  <em>{formatPrice(post.priceAud)}</em>
                </a>
              ))}
            </div>
          )}
        </section>
      </section>
    </AdminShell>
  );
}
