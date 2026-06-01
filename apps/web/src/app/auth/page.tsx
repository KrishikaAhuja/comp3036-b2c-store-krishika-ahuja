import { AuthForm } from "./AuthForm";
import styles from "./auth-page.module.css";

export default function AuthPage() {
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
