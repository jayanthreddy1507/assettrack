import type { DashboardUser } from "@/components/dashboard";

export type OrganizationTab = "departments" | "categories" | "employees";
export type RecordStatus = "Active" | "Inactive";

export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "MANAGER"
  | "TECHNICIAN"
  | "EMPLOYEE"
  | "AUDITOR";

export type EmployeeStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "ON_LEAVE"
  | "TERMINATED"
  | "SUSPENDED";

export interface DepartmentRecord {
  id: string;
  name: string;
  code: string;
  description?: string;
  parentDepartmentId?: string;
  parentDepartmentName?: string;
  managerId?: string;
  managerName?: string;
  status: RecordStatus;
  employeeCount: number;
  assetCount: number;
}

export interface CategoryRecord {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  parentCategoryId?: string;
  parentCategoryName?: string;
  status: RecordStatus;
  assetCount: number;
}

export interface EmployeeRecord {
  id: string;
  name: string;
  email: string;
  employeeId?: string;
  phone?: string;
  departmentId?: string;
  departmentName?: string;
  role: UserRole;
  status: EmployeeStatus;
  avatar?: string;
}

export interface OrganizationData {
  user: DashboardUser;
  departments: DepartmentRecord[];
  categories: CategoryRecord[];
  employees: EmployeeRecord[];
}
