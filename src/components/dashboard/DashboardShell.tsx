"use client";

import { useState, type ReactNode } from "react";
import type { DashboardUser } from "./dashboard.types";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardTopbar } from "./DashboardTopbar";

export interface DashboardShellProps {
  user: DashboardUser;
  children: ReactNode;
}

export function DashboardShell({
  user,
  children,
}: DashboardShellProps) {
  const [mobileNavigationOpen, setMobileNavigationOpen] =
    useState(false);

  return (
    <div
      className="dashboard-shell"
      data-mobile-nav-open={mobileNavigationOpen}
    >
      <div
        className="dashboard-mobile-overlay"
        onClick={() => setMobileNavigationOpen(false)}
      />

      <DashboardSidebar />

      <div className="dashboard-main">
        <DashboardTopbar
          user={user}
          onOpenMenu={() => setMobileNavigationOpen(true)}
        />
        <main>{children}</main>
      </div>
    </div>
  );
}
