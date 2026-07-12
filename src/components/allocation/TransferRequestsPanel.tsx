import { Badge, Button } from "@/components/ui";
import type {
  TransferRequest,
  TransferStatus,
} from "./allocation.types";

function tone(status: TransferStatus) {
  if (status === "APPROVED" || status === "COMPLETED") return "success";
  if (status === "REQUESTED") return "warning";
  if (status === "REJECTED" || status === "CANCELLED") return "danger";
  return "neutral";
}

export interface TransferRequestsPanelProps {
  transfers: TransferRequest[];
  onUpdateStatus: (id: string, status: TransferStatus) => void;
}

export function TransferRequestsPanel({
  transfers,
  onUpdateStatus,
}: TransferRequestsPanelProps) {
  return (
    <div className="allocation-table-panel">
      <table className="allocation-table">
        <thead>
          <tr>
            <th>Asset</th>
            <th>From</th>
            <th>To</th>
            <th>Requested On</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transfers.map((transfer) => (
            <tr key={transfer.id}>
              <td>
                <strong>{transfer.assetTag}</strong>
                <span>{transfer.assetName}</span>
              </td>
              <td>{transfer.fromUserName || "Unassigned"}</td>
              <td>{transfer.toUserName}</td>
              <td>{transfer.requestedOn}</td>
              <td>{transfer.reason}</td>
              <td>
                <Badge tone={tone(transfer.status)}>
                  {transfer.status}
                </Badge>
              </td>
              <td>
                {transfer.status === "REQUESTED" ? (
                  <div className="allocation-table-actions">
                    <Button
                      size="sm"
                      onClick={() =>
                        onUpdateStatus(transfer.id, "APPROVED")
                      }
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        onUpdateStatus(transfer.id, "REJECTED")
                      }
                    >
                      Reject
                    </Button>
                  </div>
                ) : (
                  "—"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
