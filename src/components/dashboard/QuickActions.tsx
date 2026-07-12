import Link from "next/link";
import {
  DashboardIcon,
  type DashboardIconName,
} from "./DashboardIcons";

interface QuickAction {
  label: string;
  href: string;
  icon: DashboardIconName;
}

const actions: QuickAction[] = [
  {
    label: "Register Asset",
    href: "/assets/register",
    icon: "plus",
  },
  {
    label: "Book Resource",
    href: "/bookings/new",
    icon: "calendar",
  },
  {
    label: "Raise Maintenance Request",
    href: "/maintenance/new",
    icon: "tool",
  },
];

export function QuickActions() {
  return (
    <section className="dashboard-panel dashboard-quick-actions">
      <div className="dashboard-panel__header">
        <div>
          <h2>Quick Actions</h2>
          <p>Start a common workflow.</p>
        </div>
      </div>

      <div className="dashboard-quick-actions__list">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="dashboard-quick-action"
          >
            <span className="dashboard-quick-action__icon">
              <DashboardIcon name={action.icon} size={17} />
            </span>
            <span>{action.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
