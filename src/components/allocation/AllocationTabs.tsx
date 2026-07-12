import type { AllocationTab } from "./allocation.types";
import { AllocationIcon } from "./AllocationIcons";

export interface AllocationTabsProps {
  activeTab: AllocationTab;
  onChange: (tab: AllocationTab) => void;
}

const tabs: Array<{
  id: AllocationTab;
  label: string;
  icon: "user" | "transfer" | "return" | "history";
}> = [
  { id: "allocate", label: "Allocate Asset", icon: "user" },
  { id: "transfers", label: "Transfer Requests", icon: "transfer" },
  { id: "return", label: "Return Asset", icon: "return" },
  { id: "history", label: "Allocation History", icon: "history" },
];

export function AllocationTabs({ activeTab, onChange }: AllocationTabsProps) {
  return (
    <div className="allocation-tabs" role="tablist">
      {tabs.map((tab) => (
        <button
          role="tab"
          key={tab.id}
          type="button"
          className="allocation-tab"
          data-active={activeTab === tab.id}
          aria-selected={activeTab === tab.id}
          onClick={() => onChange(tab.id)}
        >
          <AllocationIcon name={tab.icon} size={15} />
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
