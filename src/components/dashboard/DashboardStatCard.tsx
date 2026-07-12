import type { DashboardStat } from "./dashboard.types";
import { DashboardIcon } from "./DashboardIcons";

export interface DashboardStatCardProps {
  stat: DashboardStat;
}

export function DashboardStatCard({
  stat,
}: DashboardStatCardProps) {
  return (
    <article
      className="dashboard-stat-card"
      data-tone={stat.tone}
    >
      <p className="dashboard-stat-card__label">{stat.label}</p>
      <strong className="dashboard-stat-card__value">{stat.value}</strong>
      <div
        className="dashboard-stat-card__meta"
        data-direction={stat.direction ?? "neutral"}
      >
        {stat.direction === "up" && (
          <DashboardIcon name="arrowUp" size={13} />
        )}
        {stat.direction === "down" && (
          <DashboardIcon name="arrowDown" size={13} />
        )}
        <span>{stat.meta}</span>
      </div>
    </article>
  );
}
