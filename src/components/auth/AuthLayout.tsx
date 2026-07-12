import type { ReactNode } from "react";
import { Logo } from "@/components/ui/Logo";

type AuthLayoutProps = { children: ReactNode };

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="auth-page">
      <div className="auth-shell page-container">
        <aside className="auth-brand-panel">
          <div className="auth-decoration auth-decoration--blue" />
          <div className="auth-decoration auth-decoration--peach" />
          <Logo inverted />
          <div className="auth-brand-copy">
            <p className="eyebrow">Enterprise workspace</p>
            <h1 className="heading-1">Manage every asset from one secure place.</h1>
            <p className="paragraph auth-brand-description">
              Track allocations, bookings, maintenance and employee access with AssetFlow.
            </p>
          </div>
          <div className="auth-feature-card">
            <strong>Secure role assignment</strong>
            <p>New signups create employee accounts only. Administrators assign elevated roles later.</p>
          </div>
        </aside>
        <section className="auth-content">{children}</section>
      </div>
    </main>
  );
}
