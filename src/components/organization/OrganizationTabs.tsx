import type { OrganizationTab } from "./organization.types";
import { OrganizationIcon } from "./OrganizationIcons";

export interface OrganizationTabsProps {
  activeTab: OrganizationTab;
  onChange: (tab: OrganizationTab) => void;
}

const tabs: Array<{
  id: OrganizationTab;
  label: string;
  icon: "building" | "category" | "employee";
}> = [
  {
    id: "departments",
    label: "Department Management",
    icon: "building",
  },
  {
    id: "categories",
    label: "Asset Category Management",
    icon: "category",
  },
  {
    id: "employees",
    label: "Employee Directory",
    icon: "employee",
  },
];

export function OrganizationTabs({
  activeTab,
  onChange,
}: OrganizationTabsProps) {
  return (
    <div className="organization-tabs" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className="organization-tab"
          role="tab"
          aria-selected={activeTab === tab.id}
          data-active={activeTab === tab.id}
          onClick={() => onChange(tab.id)}
        >
          <OrganizationIcon name={tab.icon} size={16} />
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
