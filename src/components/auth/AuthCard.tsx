import type { ReactNode } from "react";
import { Logo } from "@/components/ui";

export interface AuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="auth-card fade-in">
      <div className="auth-card__mobile-logo">
        <Logo />
      </div>

      <div className="auth-card__avatar" aria-hidden="true">
        AF
      </div>

      <header className="auth-card__header">
        <h2 className="heading-3">{title}</h2>
        <p className="subtitle">{subtitle}</p>
      </header>

      {children}
    </div>
  );
}
