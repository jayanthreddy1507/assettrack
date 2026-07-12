import type { DashboardUser } from "@/components/dashboard";

export interface ChartPoint {
  label: string;
  value: number;
}

export interface ReportsData {
  user: DashboardUser;
  utilizationByDepartment: ChartPoint[];
  maintenanceFrequency: ChartPoint[];
  mostUsedAssets: string[];
  idleAssets: string[];
  dueMaintenance: string[];
  bookingHeatmap: number[][];
}
