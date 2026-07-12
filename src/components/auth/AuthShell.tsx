import type { ReactNode } from "react";
import { AuthBrandPanel } from "./AuthBrandPanel";

export interface AuthShellProps {
  children: ReactNode;
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <main className="auth-page">
      <div className="auth-page__container">
        <AuthBrandPanel />
        <section className="auth-form-panel">{children}</section>
      </div>
    </main>
  );
}
