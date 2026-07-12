import { Button } from "@/components/ui";
import type { AllocationAsset } from "./allocation.types";
import { AllocationIcon } from "./AllocationIcons";

export interface AllocationStatusCardProps {
  asset?: AllocationAsset;
  onRequestTransfer: () => void;
}

export function AllocationStatusCard({
  asset,
  onRequestTransfer,
}: AllocationStatusCardProps) {
  if (!asset) {
    return (
      <aside className="allocation-status-card allocation-status-card--empty">
        <AllocationIcon name="alert" size={22} />
        <p>Select an asset to view its allocation status.</p>
      </aside>
    );
  }

  const allocated = Boolean(asset.currentHolderId);

  return (
    <aside
      className="allocation-status-card"
      data-allocated={allocated}
    >
      <p className="allocation-status-card__label">Asset Status</p>

      <strong>
        {allocated ? "Currently Allocated" : "Available"}
      </strong>

      <div className="allocation-status-card__details">
        <div>
          <span>Held By</span>
          <b>{asset.currentHolderName || "—"}</b>
        </div>
        <div>
          <span>Department</span>
          <b>{asset.currentHolderDepartment || "—"}</b>
        </div>
        <div>
          <span>Since</span>
          <b>{asset.allocatedSince || "—"}</b>
        </div>
        <div>
          <span>Expected Return</span>
          <b>{asset.expectedReturn || "—"}</b>
        </div>
      </div>

      {allocated && (
        <>
          <div className="allocation-conflict-message">
            <AllocationIcon name="alert" size={16} />
            <span>
              This asset is already allocated. Direct reallocation is blocked.
            </span>
          </div>

          <Button
            fullWidth
            leftIcon={<AllocationIcon name="transfer" size={15} />}
            onClick={onRequestTransfer}
          >
            Request Transfer
          </Button>
        </>
      )}
    </aside>
  );
}
