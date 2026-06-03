import { getCurrentUser } from "../../utils/auth";
import { redirect } from "next/navigation";
import { AuthForm } from "./AuthForm";
import styles from "./auth-page.module.css";
import { getSafeNextPath } from "../../utils/customerAuthRedirect";

function getAdminRedirectUrl() {
  if (process.env.NEXT_PUBLIC_ADMIN_URL) {
    return process.env.NEXT_PUBLIC_ADMIN_URL;
  }

  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3002";
  }

  return "/";
}

export default async function AuthPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string }>;
}) {
  const user = await getCurrentUser();
  const params = await searchParams;
  const nextPath = getSafeNextPath(params?.next);

  if (user?.role === "ADMIN") {
    redirect(getAdminRedirectUrl());
  }

  if (user?.role === "CUSTOMER") {
    redirect(nextPath);
  }

  return (
    <main className={styles.shell}>
      <div className={styles.band} />
      <div className={`${styles.band} ${styles.bandSecondary}`} />
      <div className={styles.content}>
        <AuthForm nextPath={nextPath} />
      </div>
    </main>
  );
}
