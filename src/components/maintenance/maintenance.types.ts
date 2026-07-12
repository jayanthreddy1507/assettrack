import type { DashboardUser } from "@/components/dashboard";

export type MaintenanceStatus =
  | "PENDING"
  | "APPROVED"
  | "TECHNICIAN_ASSIGNED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "REJECTED";

export type MaintenancePriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

export interface MaintenanceAsset {
  id: string;
  assetTag: string;
  name: string;
}

export interface TechnicianOption {
  id: string;
  name: string;
}

export interface MaintenanceRequest {
  id: string;
  requestId: string;
  assetId: string;
  assetTag: string;
  assetName: string;
  issue: string;
  description?: string;
  requestedBy: string;
  requestedOn: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  approvedBy?: string;
  technicianId?: string;
  technicianName?: string;
  resolvedOn?: string;
}

export interface MaintenanceData {
  user: DashboardUser;
  assets: MaintenanceAsset[];
  technicians: TechnicianOption[];
  requests: MaintenanceRequest[];
}
