import { Select } from "@/components/ui";
import { AssetIcon } from "./AssetIcons";
import type {
  AssetCategoryOption,
  AssetStatus,
  DepartmentOption,
} from "./asset.types";

export interface AssetFiltersProps {
  query: string;
  categoryId: string;
  status: string;
  departmentId: string;
  categories: AssetCategoryOption[];
  departments: DepartmentOption[];
  onQueryChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
}

const statusOptions: Array<{
  label: string;
  value: AssetStatus;
}> = [
  { label: "Active", value: "ACTIVE" },
  { label: "Available", value: "AVAILABLE" },
  { label: "Allocated", value: "ASSIGNED" },
  { label: "Reserved", value: "RESERVED" },
  { label: "Under Maintenance", value: "IN_MAINTENANCE" },
  { label: "Decommissioned", value: "DECOMMISSIONED" },
  { label: "Lost", value: "LOST" },
  { label: "Stolen", value: "STOLEN" },
];

export function AssetFilters({
  query,
  categoryId,
  status,
  departmentId,
  categories,
  departments,
  onQueryChange,
  onCategoryChange,
  onStatusChange,
  onDepartmentChange,
}: AssetFiltersProps) {
  return (
    <div className="asset-filters">
      <label className="asset-search-field">
        <AssetIcon name="search" size={16} />
        <input
          type="search"
          value={query}
          placeholder="Search by Asset Tag, Serial No., Name..."
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </label>

      <Select
        aria-label="Filter by category"
        value={categoryId}
        placeholder="All Categories"
        options={categories.map((category) => ({
          label: category.name,
          value: category.id,
        }))}
        onChange={(event) => onCategoryChange(event.target.value)}
      />

      <Select
        aria-label="Filter by status"
        value={status}
        placeholder="All Status"
        options={statusOptions}
        onChange={(event) => onStatusChange(event.target.value)}
      />

      <Select
        aria-label="Filter by department"
        value={departmentId}
        placeholder="All Departments"
        options={departments.map((department) => ({
          label: department.name,
          value: department.id,
        }))}
        onChange={(event) => onDepartmentChange(event.target.value)}
      />
    </div>
  );
}
