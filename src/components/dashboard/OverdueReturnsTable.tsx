import { Badge } from "@/components/ui";
import type { OverdueReturn } from "./dashboard.types";

export interface OverdueReturnsTableProps {
  returns: OverdueReturn[];
}

export function OverdueReturnsTable({
  returns,
}: OverdueReturnsTableProps) {
  return (
    <section className="dashboard-panel dashboard-overdue-panel">
      <div className="dashboard-panel__header">
        <div>
          <h2>Overdue Returns</h2>
          <p>Assets past their expected return date.</p>
        </div>
        <Badge tone="danger">
          {returns.length} overdue
        </Badge>
      </div>

      <div className="dashboard-table-scroll">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Asset Tag</th>
              <th>Asset Name</th>
              <th>Held By</th>
              <th>Expected Return</th>
              <th>Days Overdue</th>
            </tr>
          </thead>
          <tbody>
            {returns.map((item) => (
              <tr key={item.id}>
                <td className="dashboard-table__tag">{item.assetTag}</td>
                <td>{item.assetName}</td>
                <td>{item.heldBy}</td>
                <td>{item.expectedReturn}</td>
                <td>
                  <span className="dashboard-overdue-days">
                    {item.daysOverdue} days
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
