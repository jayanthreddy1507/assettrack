import type { AuditCycle } from "./audit.types";
import { AuditCycleStatusBadge } from "./AuditStatusBadge";

export function AuditCycleTable({
  cycles,
  onOpen,
}: {
  cycles: AuditCycle[];
  onOpen: (cycle: AuditCycle) => void;
}) {
  return (
    <div className="audit-table-scroll">
      <table className="audit-table">
        <thead>
          <tr>
            <th>Audit Name</th>
            <th>Scope</th>
            <th>Auditors</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
            <th>Discrepancies</th>
          </tr>
        </thead>
        <tbody>
          {cycles.map((cycle) => {
            const discrepancies = cycle.items.filter(
              (item) =>
                item.verification === "MISSING" ||
                item.verification === "DAMAGED"
            ).length;

            return (
              <tr key={cycle.id} onClick={() => onOpen(cycle)}>
                <td>{cycle.name}</td>
                <td>{cycle.scope}</td>
                <td>{cycle.auditors.length}</td>
                <td>{cycle.startDate}</td>
                <td>{cycle.endDate}</td>
                <td>
                  <AuditCycleStatusBadge status={cycle.status} />
                </td>
                <td>{discrepancies || "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
