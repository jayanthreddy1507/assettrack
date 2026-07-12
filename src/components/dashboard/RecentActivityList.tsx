import type { RecentActivity } from "./dashboard.types";
import {
  DashboardIcon,
  type DashboardIconName,
} from "./DashboardIcons";

const activityIcons: Record<
  RecentActivity["type"],
  DashboardIconName
> = {
  asset: "assets",
  booking: "bookings",
  maintenance: "maintenance",
  transfer: "allocation",
  audit: "audits",
  return: "arrowDown",
};

export interface RecentActivityListProps {
  activity: RecentActivity[];
}

export function RecentActivityList({
  activity,
}: RecentActivityListProps) {
  return (
    <section className="dashboard-panel dashboard-activity-panel">
      <div className="dashboard-panel__header">
        <div>
          <h2>Recent Activity</h2>
          <p>Latest changes across your organization.</p>
        </div>
      </div>

      <div className="dashboard-activity-list">
        {activity.map((item) => (
          <article
            key={item.id}
            className="dashboard-activity-item"
            data-type={item.type}
          >
            <span className="dashboard-activity-item__icon">
              <DashboardIcon
                name={activityIcons[item.type]}
                size={17}
              />
            </span>

            <div className="dashboard-activity-item__copy">
              <strong>{item.title}</strong>
              <p>{item.description}</p>
            </div>

            <time>{item.timestamp}</time>
          </article>
        ))}
      </div>
    </section>
  );
}
