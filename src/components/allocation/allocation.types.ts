import type { DashboardUser } from "@/components/dashboard";

export type AllocationTab =
  | "allocate"
  | "transfers"
  | "return"
  | "history";

export type TransferStatus =
  | "REQUESTED"
  | "APPROVED"
  | "COMPLETED"
  | "REJECTED"
  | "CANCELLED";

export interface AllocationAsset {
  id: string;
  assetTag: string;
  name: string;
  categoryName?: string;
  status: string;
  currentHolderId?: string;
  currentHolderName?: string;
  currentHolderDepartment?: string;
  allocatedSince?: string;
  expectedReturn?: string;
}

export interface AllocationPerson {
  id: string;
  name: string;
  departmentName?: string;
  role?: string;
}

export interface TransferRequest {
  id: string;
  assetId: string;
  assetTag: string;
  assetName: string;
  fromUserId?: string;
  fromUserName?: string;
  toUserId: string;
  toUserName: string;
  reason: string;
  requestedOn: string;
  status: TransferStatus;
}

export interface ReturnRequest {
  id: string;
  assetId: string;
  assetTag: string;
  assetName: string;
  holderName: string;
  returnedOn: string;
  condition: string;
  notes?: string;
}

export interface AllocationHistoryItem {
  id: string;
  assetId: string;
  assetTag: string;
  assetName: string;
  action: "ALLOCATED" | "TRANSFERRED" | "RETURNED";
  description: string;
  date: string;
}

export interface AllocationData {
  user: DashboardUser;
  assets: AllocationAsset[];
  people: AllocationPerson[];
  transfers: TransferRequest[];
  returns: ReturnRequest[];
  history: AllocationHistoryItem[];
}
