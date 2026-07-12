import { Avatar, Badge } from "@/components/ui";
import type {
  EmployeeRecord,
  EmployeeStatus,
  UserRole,
} from "./organization.types";
import { OrganizationActionButtons } from "./OrganizationActionButtons";

const roleLabels: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  MANAGER: "Manager",
  TECHNICIAN: "Technician",
  EMPLOYEE: "Employee",
  AUDITOR: "Auditor",
};

const statusLabels: Record<EmployeeStatus, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  ON_LEAVE: "On Leave",
  TERMINATED: "Terminated",
  SUSPENDED: "Suspended",
};

function employeeStatusTone(
  status: EmployeeStatus
): "success" | "danger" | "warning" | "neutral" {
  if (status === "ACTIVE") return "success";
  if (status === "ON_LEAVE") return "warning";
  if (status === "INACTIVE" || status === "SUSPENDED") {
    return "danger";
  }
  return "neutral";
}

export interface EmployeesTableProps {
  employees: EmployeeRecord[];
  onEdit: (employee: EmployeeRecord) => void;
  onToggleStatus: (id: string) => void;
}

export function EmployeesTable({
  employees,
  onEdit,
  onToggleStatus,
}: EmployeesTableProps) {
  return (
    <div className="organization-table-scroll">
      <table className="organization-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Employee ID</th>
            <th>Department</th>
            <th>Role</th>
            <th>Phone</th>
            <th>Status</th>
            <th className="organization-table__actions-heading">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td>
                <div className="organization-employee-cell">
                  <Avatar
                    name={employee.name}
                    src={employee.avatar}
                    size="sm"
                  />
                  <div>
                    <strong>{employee.name}</strong>
                    <span>{employee.email}</span>
                  </div>
                </div>
              </td>
              <td>{employee.employeeId || "—"}</td>
              <td>{employee.departmentName || "Unassigned"}</td>
              <td>
                <Badge tone="info">
                  {roleLabels[employee.role]}
                </Badge>
              </td>
              <td>{employee.phone || "—"}</td>
              <td>
                <Badge tone={employeeStatusTone(employee.status)}>
                  {statusLabels[employee.status]}
                </Badge>
              </td>
              <td>
                <OrganizationActionButtons
                  label={employee.name}
                  inactive={employee.status === "INACTIVE"}
                  onEdit={() => onEdit(employee)}
                  onDeactivate={() => onToggleStatus(employee.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
