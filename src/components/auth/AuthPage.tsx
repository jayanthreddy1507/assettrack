import { AuthBrand } from "./AuthBrand";
import { AuthForm } from "./AuthForm";
import styles from "./AuthPage.module.css";

export function AuthPage() {
  return (
    <main className={styles.authPage}>
      <div className={`${styles.authShell} page-container`}>
        <aside className={styles.brandPanel}>
          <div className={styles.decorOne} />
          <div className={styles.decorTwo} />
          <AuthBrand />

          <div className={styles.featureCard}>
            <p className="heading-3">Simple access management</p>
            <p className="paragraph-small">
              Employees create an account first. Administrators can approve access and assign roles later.
            </p>
          </div>
        </aside>

        <AuthForm />
      </div>
    </main>
  );
}
