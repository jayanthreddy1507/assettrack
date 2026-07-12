import type {
  MaintenanceRequest,
  MaintenanceStatus,
  TechnicianOption,
} from "./maintenance.types";
import { MaintenanceIcon } from "./MaintenanceIcons";

const columns: Array<{
  status: MaintenanceStatus;
  label: string;
  icon: "pending" | "approved" | "technician" | "progress" | "resolved";
}> = [
  { status: "PENDING", label: "Pending", icon: "pending" },
  { status: "APPROVED", label: "Approved", icon: "approved" },
  {
    status: "TECHNICIAN_ASSIGNED",
    label: "Technician Assigned",
    icon: "technician",
  },
  { status: "IN_PROGRESS", label: "In Progress", icon: "progress" },
  { status: "RESOLVED", label: "Resolved", icon: "resolved" },
];

export interface MaintenanceKanbanProps {
  requests: MaintenanceRequest[];
  technicians: TechnicianOption[];
  onAdvance: (id: string) => void;
}

export function MaintenanceKanban({
  requests,
  onAdvance,
}: MaintenanceKanbanProps) {
  return (
    <div className="maintenance-kanban">
      {columns.map((column) => {
        const cards = requests.filter(
          (request) => request.status === column.status
        );

        return (
          <section key={column.status} className="maintenance-kanban-column">
            <header>
              <span>
                <MaintenanceIcon name={column.icon} size={15} />
              </span>
              <strong>{column.label}</strong>
              <small>{cards.length}</small>
            </header>

            <div className="maintenance-kanban-column__cards">
              {cards.map((request) => (
                <button
                  key={request.id}
                  type="button"
                  className="maintenance-kanban-card"
                  data-status={request.status}
                  onClick={() => onAdvance(request.id)}
                >
                  <span>{request.requestId}</span>
                  <strong>
                    {request.assetTag} – {request.assetName}
                  </strong>
                  <p>{request.issue}</p>
                  {request.technicianName && (
                    <small>{request.technicianName}</small>
                  )}
                  {request.resolvedOn && (
                    <small>Resolved {request.resolvedOn}</small>
                  )}
                </button>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
