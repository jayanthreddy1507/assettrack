export type StatTone = "mint" | "sky" | "cream" | "peach" | "sage";

export interface DashboardUser {
  name: string;
  role: string;
  avatar?: string;
}

export interface DashboardStat {
  id: string;
  label: string;
  value: number;
  meta: string;
  direction?: "up" | "down" | "neutral";
  tone: StatTone;
}

export interface OverdueReturn {
  id: string;
  assetTag: string;
  assetName: string;
  heldBy: string;
  expectedReturn: string;
  daysOverdue: number;
}

export interface RecentActivity {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type:
    | "asset"
    | "booking"
    | "maintenance"
    | "transfer"
    | "audit"
    | "return";
}

export interface DashboardData {
  user: DashboardUser;
  stats: DashboardStat[];
  overdueReturns: OverdueReturn[];
  recentActivity: RecentActivity[];
}
