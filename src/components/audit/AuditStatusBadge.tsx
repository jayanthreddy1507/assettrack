import { Badge } from "@/components/ui";
import type {
  AuditStatus,
  VerificationStatus,
} from "./audit.types";

export function AuditCycleStatusBadge({
  status,
}: {
  status: AuditStatus;
}) {
  const tone =
    status === "COMPLETED" || status === "CLOSED"
      ? "success"
      : status === "IN_PROGRESS"
      ? "info"
      : "neutral";

  return <Badge tone={tone}>{status.replaceAll("_", " ")}</Badge>;
}

export function VerificationBadge({
  status,
}: {
  status: VerificationStatus;
}) {
  const tone =
    status === "VERIFIED"
      ? "success"
      : status === "MISSING"
      ? "danger"
      : status === "DAMAGED"
      ? "warning"
      : "neutral";

  return <Badge tone={tone}>{status}</Badge>;
}
