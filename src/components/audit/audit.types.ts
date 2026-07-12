import type { DashboardUser } from "@/components/dashboard";

export type AuditStatus =
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CLOSED";

export type VerificationStatus =
  | "PENDING"
  | "VERIFIED"
  | "MISSING"
  | "DAMAGED";

export interface AuditAssetItem {
  id: string;
  assetId: string;
  assetTag: string;
  assetName: string;
  expectedLocation: string;
  verification: VerificationStatus;
  notes?: string;
}

export interface AuditCycle {
  id: string;
  name: string;
  scope: string;
  auditors: string[];
  startDate: string;
  endDate: string;
  status: AuditStatus;
  items: AuditAssetItem[];
}

export interface AuditData {
  user: DashboardUser;
  cycles: AuditCycle[];
  auditorOptions: string[];
}
