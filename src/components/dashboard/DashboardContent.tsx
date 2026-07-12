import type { DashboardData } from "./dashboard.types";
import { DashboardStatsGrid } from "./DashboardStatsGrid";
import { OverdueReturnsTable } from "./OverdueReturnsTable";
import { QuickActions } from "./QuickActions";
import { RecentActivityList } from "./RecentActivityList";

export interface DashboardContentProps {
  data: DashboardData;
}

export function DashboardContent({
  data,
}: DashboardContentProps) {
  const firstName = data.user.name.split(" ")[0];

  return (
    <div className="dashboard-content">
      <header className="dashboard-page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, {firstName}!</p>
        </div>
      </header>

      <DashboardStatsGrid stats={data.stats} />

      <div className="dashboard-alert-strip">
        <strong>
          {data.overdueReturns.length} assets are overdue for return
        </strong>
        <span>Flagged for follow-up and shown below.</span>
      </div>

      <div className="dashboard-primary-grid">
        <OverdueReturnsTable returns={data.overdueReturns} />
        <QuickActions />
      </div>

      <RecentActivityList activity={data.recentActivity} />
    </div>
  );
}
