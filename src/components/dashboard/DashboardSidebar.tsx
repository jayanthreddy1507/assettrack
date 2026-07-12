"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui";
import {
  DashboardIcon,
  type DashboardIconName,
} from "./DashboardIcons";

interface NavigationItem {
  label: string;
  href: string;
  icon: DashboardIconName;
}

const navigationItems: NavigationItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { label: "Assets", href: "/assets", icon: "assets" },
  { label: "Allocation", href: "/allocation", icon: "allocation" },
  { label: "Bookings", href: "/bookings", icon: "bookings" },
  { label: "Maintenance", href: "/maintenance", icon: "maintenance" },
  { label: "Audits", href: "/audits", icon: "audits" },
  { label: "Reports", href: "/reports", icon: "reports" },
  { label: "Organization", href: "/organization", icon: "organization" },
  { label: "Notifications", href: "/notifications", icon: "notifications" },
  { label: "Settings", href: "/settings", icon: "settings" },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="dashboard-sidebar">
      <div className="dashboard-sidebar__brand">
        <Logo />
      </div>

      <nav className="dashboard-sidebar__navigation" aria-label="Main navigation">
        {navigationItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              className="dashboard-nav-item"
              data-active={active}
            >
              <DashboardIcon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
