import { Badge } from "@/components/ui";
import type { MaintenanceStatus } from "./maintenance.types";

const labels: Record<MaintenanceStatus, string> = {
  PENDING: "Pending Approval",
  APPROVED: "Approved",
  TECHNICIAN_ASSIGNED: "Technician Assigned",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  REJECTED: "Rejected",
};

function tone(status: MaintenanceStatus) {
  if (status === "RESOLVED" || status === "APPROVED") return "success";
  if (status === "PENDING" || status === "TECHNICIAN_ASSIGNED") return "warning";
  if (status === "REJECTED") return "danger";
  if (status === "IN_PROGRESS") return "info";
  return "neutral";
}

export function MaintenanceStatusBadge({
  status,
}: {
  status: MaintenanceStatus;
}) {
  return <Badge tone={tone(status)}>{labels[status]}</Badge>;
}
