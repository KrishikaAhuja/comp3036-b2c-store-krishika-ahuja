import { redirect } from "next/navigation";
import { isLoggedIn } from "../../utils/auth";
import { AdminShell } from "../AdminShell";
import { getAdminShellStats } from "../adminData";
import styles from "../admin-list.module.css";

export const dynamic = "force-dynamic";

const customerPreviewUrl = new URL(
  process.env.CUSTOMER_SITE_URL || "http://localhost:3001",
);
customerPreviewUrl.searchParams.set("preview", "admin");

export default async function PreviewPage() {
  const loggedIn = await isLoggedIn();

  if (!loggedIn) {
    redirect("/");
  }

  const shellStats = await getAdminShellStats();

  return (
    <AdminShell active="preview" {...shellStats}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Storefront</p>
          <h1 className={styles.title}>Customer Preview</h1>
        </div>
      </header>

      <section className={styles.previewPanel}>
        <div className={styles.previewToolbar}>
          <strong>Administrative read-only preview of the customer storefront</strong>
        </div>
        <iframe
          title="Customer storefront preview"
          src={customerPreviewUrl.toString()}
          sandbox="allow-scripts allow-same-origin"
          className={styles.storePreviewFrame}
        />
      </section>
    </AdminShell>
  );
}
