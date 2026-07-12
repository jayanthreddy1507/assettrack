import { Button } from "@/components/ui";
import type {
  AuditCycle,
  VerificationStatus,
} from "./audit.types";
import { VerificationBadge } from "./AuditStatusBadge";

export function AuditDetails({
  cycle,
  onUpdateVerification,
  onCloseCycle,
}: {
  cycle: AuditCycle;
  onUpdateVerification: (
    itemId: string,
    status: VerificationStatus
  ) => void;
  onCloseCycle: () => void;
}) {
  const discrepancyCount = cycle.items.filter(
    (item) =>
      item.verification === "MISSING" ||
      item.verification === "DAMAGED"
  ).length;

  return (
    <section className="audit-details">
      <header className="audit-details__summary">
        <div>
          <strong>{cycle.name}</strong>
          <span>
            {cycle.scope} · {cycle.startDate} to {cycle.endDate}
          </span>
          <small>Auditors: {cycle.auditors.join(", ")}</small>
        </div>
      </header>

      <div className="audit-details__table-scroll">
        <table className="audit-details__table">
          <thead>
            <tr>
              <th>Asset</th>
              <th>Expected Location</th>
              <th>Verification</th>
            </tr>
          </thead>
          <tbody>
            {cycle.items.map((item) => (
              <tr key={item.id}>
                <td>
                  {item.assetTag} {item.assetName}
                </td>
                <td>{item.expectedLocation}</td>
                <td>
                  <select
                    value={item.verification}
                    onChange={(event) =>
                      onUpdateVerification(
                        item.id,
                        event.target.value as VerificationStatus
                      )
                    }
                  >
                    <option value="PENDING">Pending</option>
                    <option value="VERIFIED">Verified</option>
                    <option value="MISSING">Missing</option>
                    <option value="DAMAGED">Damaged</option>
                  </select>
                  <VerificationBadge status={item.verification} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="audit-discrepancy-banner">
        {discrepancyCount} assets flagged — discrepancy report generated automatically
      </div>

      <Button onClick={onCloseCycle}>Close Audit Cycle</Button>
    </section>
  );
}
