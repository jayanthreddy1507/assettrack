import { Badge } from "@/components/ui";
import type { AssetStatus } from "./asset.types";

const labels: Record<AssetStatus, string> = {
  ACTIVE: "Active",
  AVAILABLE: "Available",
  ASSIGNED: "Allocated",
  IN_MAINTENANCE: "Under Maintenance",
  DECOMMISSIONED: "Decommissioned",
  LOST: "Lost",
  STOLEN: "Stolen",
  RESERVED: "Reserved",
};

function getTone(
  status: AssetStatus
): "success" | "warning" | "danger" | "info" | "neutral" {
  if (status === "AVAILABLE" || status === "ACTIVE") return "success";
  if (status === "ASSIGNED") return "info";
  if (status === "RESERVED" || status === "IN_MAINTENANCE") return "warning";
  if (status === "LOST" || status === "STOLEN") return "danger";
  return "neutral";
}

export function AssetStatusBadge({ status }: { status: AssetStatus }) {
  return <Badge tone={getTone(status)}>{labels[status]}</Badge>;
}
