import type { DashboardUser } from "@/components/dashboard";

export type AssetStatus =
  | "ACTIVE"
  | "AVAILABLE"
  | "ASSIGNED"
  | "IN_MAINTENANCE"
  | "DECOMMISSIONED"
  | "LOST"
  | "STOLEN"
  | "RESERVED";

export type AssetCondition =
  | "NEW"
  | "GOOD"
  | "FAIR"
  | "POOR"
  | "DAMAGED";

export interface AssetCategoryOption {
  id: string;
  name: string;
}

export interface DepartmentOption {
  id: string;
  name: string;
}

export interface EmployeeOption {
  id: string;
  name: string;
}

export interface AssetRecord {
  id: string;
  assetTag: string;
  name: string;
  serialNumber?: string;
  description?: string;
  categoryId?: string;
  categoryName?: string;
  status: AssetStatus;
  condition: AssetCondition;
  location?: string;
  departmentId?: string;
  departmentName?: string;
  assignedToId?: string;
  assignedToName?: string;
  acquisitionDate?: string;
  acquisitionCost?: number;
  manufacturer?: string;
  model?: string;
  warrantyExpiry?: string;
  isBookable: boolean;
  notes?: string;
}

export interface AssetRegistryData {
  user: DashboardUser;
  assets: AssetRecord[];
  categories: AssetCategoryOption[];
  departments: DepartmentOption[];
  employees: EmployeeOption[];
}
