import type {
  CategoryRecord,
  DepartmentRecord,
  EmployeeRecord,
} from "./organization.types";
import { OrganizationIcon } from "./OrganizationIcons";

export interface OrganizationSummaryProps {
  departments: DepartmentRecord[];
  categories: CategoryRecord[];
  employees: EmployeeRecord[];
}

export function OrganizationSummary({
  departments,
  categories,
  employees,
}: OrganizationSummaryProps) {
  const activeDepartments = departments.filter(
    (item) => item.status === "Active"
  ).length;
  const activeCategories = categories.filter(
    (item) => item.status === "Active"
  ).length;
  const activeEmployees = employees.filter(
    (item) => item.status === "ACTIVE"
  ).length;

  return (
    <div className="organization-summary">
      <article>
        <span>
          <OrganizationIcon name="building" />
        </span>
        <div>
          <strong>{activeDepartments}</strong>
          <small>Active departments</small>
        </div>
      </article>

      <article>
        <span>
          <OrganizationIcon name="category" />
        </span>
        <div>
          <strong>{activeCategories}</strong>
          <small>Active categories</small>
        </div>
      </article>

      <article>
        <span>
          <OrganizationIcon name="users" />
        </span>
        <div>
          <strong>{activeEmployees}</strong>
          <small>Active employees</small>
        </div>
      </article>

      <article>
        <span>
          <OrganizationIcon name="assets" />
        </span>
        <div>
          <strong>
            {departments.reduce(
              (total, item) => total + item.assetCount,
              0
            )}
          </strong>
          <small>Tracked assets</small>
        </div>
      </article>
    </div>
  );
}
