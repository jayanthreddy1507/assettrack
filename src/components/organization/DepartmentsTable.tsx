import { Badge } from "@/components/ui";
import type { DepartmentRecord } from "./organization.types";
import { OrganizationActionButtons } from "./OrganizationActionButtons";

export interface DepartmentsTableProps {
  departments: DepartmentRecord[];
  onEdit: (department: DepartmentRecord) => void;
  onToggleStatus: (id: string) => void;
}

export function DepartmentsTable({
  departments,
  onEdit,
  onToggleStatus,
}: DepartmentsTableProps) {
  return (
    <div className="organization-table-scroll">
      <table className="organization-table">
        <thead>
          <tr>
            <th>Department Name</th>
            <th>Code</th>
            <th>Parent Department</th>
            <th>Department Head</th>
            <th>Employees</th>
            <th>Assets</th>
            <th>Status</th>
            <th className="organization-table__actions-heading">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {departments.map((department) => (
            <tr key={department.id}>
              <td>
                <div className="organization-primary-cell">
                  <strong>{department.name}</strong>
                  <span>{department.description || "No description"}</span>
                </div>
              </td>
              <td>
                <span className="organization-code">
                  {department.code}
                </span>
              </td>
              <td>{department.parentDepartmentName || "—"}</td>
              <td>{department.managerName || "Unassigned"}</td>
              <td>{department.employeeCount}</td>
              <td>{department.assetCount}</td>
              <td>
                <Badge
                  tone={
                    department.status === "Active"
                      ? "success"
                      : "danger"
                  }
                >
                  {department.status}
                </Badge>
              </td>
              <td>
                <OrganizationActionButtons
                  label={department.name}
                  inactive={department.status === "Inactive"}
                  onEdit={() => onEdit(department)}
                  onDeactivate={() => onToggleStatus(department.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
