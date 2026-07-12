import { Badge } from "@/components/ui";
import type { CategoryRecord } from "./organization.types";
import { OrganizationActionButtons } from "./OrganizationActionButtons";

export interface CategoriesTableProps {
  categories: CategoryRecord[];
  onEdit: (category: CategoryRecord) => void;
  onToggleStatus: (id: string) => void;
}

export function CategoriesTable({
  categories,
  onEdit,
  onToggleStatus,
}: CategoriesTableProps) {
  return (
    <div className="organization-table-scroll">
      <table className="organization-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Parent Category</th>
            <th>Description</th>
            <th>Assets</th>
            <th>Status</th>
            <th className="organization-table__actions-heading">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td>
                <div className="organization-category-cell">
                  <span className="organization-category-icon">
                    {category.icon || "◫"}
                  </span>
                  <strong>{category.name}</strong>
                </div>
              </td>
              <td>{category.parentCategoryName || "—"}</td>
              <td>
                <span className="organization-description">
                  {category.description || "No description"}
                </span>
              </td>
              <td>{category.assetCount}</td>
              <td>
                <Badge
                  tone={
                    category.status === "Active"
                      ? "success"
                      : "danger"
                  }
                >
                  {category.status}
                </Badge>
              </td>
              <td>
                <OrganizationActionButtons
                  label={category.name}
                  inactive={category.status === "Inactive"}
                  onEdit={() => onEdit(category)}
                  onDeactivate={() => onToggleStatus(category.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
