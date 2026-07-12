import type { DashboardStat } from "./dashboard.types";
import { DashboardStatCard } from "./DashboardStatCard";

export interface DashboardStatsGridProps {
  stats: DashboardStat[];
}

export function DashboardStatsGrid({
  stats,
}: DashboardStatsGridProps) {
  return (
    <section
      className="dashboard-stats-grid"
      aria-label="Today's operational overview"
    >
      {stats.map((stat) => (
        <DashboardStatCard key={stat.id} stat={stat} />
      ))}
    </section>
  );
}
