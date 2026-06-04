import { getCurrentUser } from "../../utils/auth";
import { redirect } from "next/navigation";
import { AuthForm } from "./AuthForm";
import styles from "./auth-page.module.css";

function getAdminRedirectUrl() {
  if (process.env.NEXT_PUBLIC_ADMIN_URL) {
    return process.env.NEXT_PUBLIC_ADMIN_URL;
  }

  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3002";
  }

  return "/";
}

export default async function AuthPage() {
  const user = await getCurrentUser();

  if (user?.role === "ADMIN") {
    redirect(getAdminRedirectUrl());
  }

  if (user?.role === "CUSTOMER") {
    redirect("/");
  }

  return (
    <main className={styles.shell}>
      <div className={styles.band} />
      <div className={`${styles.band} ${styles.bandSecondary}`} />
      <div className={styles.content}>
        <AuthForm />
      </div>
    </main>
  );
}
