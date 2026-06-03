import styles from "./admin-list.module.css";
import type { ReactNode } from "react";

type AdminShellProps = {
  active: "dashboard" | "inventory" | "customers" | "orders";
  activeBooks: number;
  outOfStockCount: number;
  children: ReactNode;
};

const navItems = [
  { key: "dashboard", href: "/", label: "Dashboard" },
  { key: "inventory", href: "/inventory", label: "Inventory" },
  { key: "customers", href: "/customers", label: "Customers" },
  { key: "orders", href: "/orders", label: "Orders" },
] as const;

export function AdminShell({
  active,
  activeBooks,
  children,
  outOfStockCount,
}: AdminShellProps) {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <a href="/" className={styles.brand}>
          <span className={styles.brandMark}>B</span>
          <span>
            <strong>Bookstore Admin</strong>
            <small>Operations</small>
          </span>
        </a>

        <nav className={styles.nav} aria-label="Admin navigation">
          {navItems.map((item) => (
            <a
              key={item.key}
              className={active === item.key ? styles.navActive : undefined}
              href={item.href}
            >
              {item.label}
            </a>
          ))}
          <a href="http://localhost:3001">Customer Site</a>
        </nav>

        <div className={styles.sidebarPanel}>
          <span>Store status</span>
          <strong>{activeBooks} active books</strong>
          <small>{outOfStockCount} out of stock</small>
        </div>

        <form action="/api/logout" method="post" className={styles.logoutForm}>
          <button type="submit" className={styles.logoutButton}>
            Logout
          </button>
        </form>
      </aside>

      <main className={styles.main}>{children}</main>
    </div>
  );
}
