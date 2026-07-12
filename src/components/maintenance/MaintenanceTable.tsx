import type { MaintenanceRequest } from "./maintenance.types";
import { MaintenanceStatusBadge } from "./MaintenanceStatusBadge";

export function MaintenanceTable({
  requests,
}: {
  requests: MaintenanceRequest[];
}) {
  return (
    <div className="maintenance-table-scroll">
      <table className="maintenance-table">
        <thead>
          <tr>
            <th>Request ID</th>
            <th>Asset</th>
            <th>Issue</th>
            <th>Requested On</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Approved By</th>
          </tr>
        </thead>

        <tbody>
          {requests.map((request) => (
            <tr key={request.id}>
              <td>{request.requestId}</td>
              <td>
                <strong>{request.assetTag}</strong>
                <span>{request.assetName}</span>
              </td>
              <td>{request.issue}</td>
              <td>{request.requestedOn}</td>
              <td>{request.priority}</td>
              <td>
                <MaintenanceStatusBadge status={request.status} />
              </td>
              <td>{request.approvedBy || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
