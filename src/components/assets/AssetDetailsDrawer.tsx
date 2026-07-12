import { Badge, Button } from "@/components/ui";
import type { AssetRecord } from "./asset.types";
import { AssetIcon } from "./AssetIcons";
import { AssetStatusBadge } from "./AssetStatusBadge";

export interface AssetDetailsDrawerProps {
  asset?: AssetRecord;
  open: boolean;
  onClose: () => void;
  onEdit: (asset: AssetRecord) => void;
}

function formatCurrency(value?: number) {
  if (value === undefined) return "—";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function AssetDetailsDrawer({
  asset,
  open,
  onClose,
  onEdit,
}: AssetDetailsDrawerProps) {
  if (!open || !asset) return null;

  return (
    <>
      <button
        type="button"
        className="asset-drawer-overlay"
        aria-label="Close asset details"
        onClick={onClose}
      />

      <aside className="asset-details-drawer" aria-label="Asset details">
        <header className="asset-details-drawer__header">
          <div>
            <span className="asset-details-drawer__eyebrow">
              {asset.assetTag}
            </span>
            <h2>{asset.name}</h2>
          </div>

          <button
            type="button"
            className="asset-drawer-close"
            aria-label="Close"
            onClick={onClose}
          >
            <AssetIcon name="close" />
          </button>
        </header>

        <div className="asset-details-drawer__status">
          <AssetStatusBadge status={asset.status} />
          <Badge tone={asset.isBookable ? "info" : "neutral"}>
            {asset.isBookable ? "Bookable" : "Not bookable"}
          </Badge>
        </div>

        <div className="asset-details-grid">
          <div>
            <span>Serial Number</span>
            <strong>{asset.serialNumber || "—"}</strong>
          </div>
          <div>
            <span>Category</span>
            <strong>{asset.categoryName || "—"}</strong>
          </div>
          <div>
            <span>Condition</span>
            <strong>{asset.condition}</strong>
          </div>
          <div>
            <span>Location</span>
            <strong>{asset.location || "—"}</strong>
          </div>
          <div>
            <span>Department</span>
            <strong>{asset.departmentName || "—"}</strong>
          </div>
          <div>
            <span>Allocated To</span>
            <strong>{asset.assignedToName || "—"}</strong>
          </div>
          <div>
            <span>Manufacturer</span>
            <strong>{asset.manufacturer || "—"}</strong>
          </div>
          <div>
            <span>Model</span>
            <strong>{asset.model || "—"}</strong>
          </div>
          <div>
            <span>Acquisition Date</span>
            <strong>{asset.acquisitionDate || "—"}</strong>
          </div>
          <div>
            <span>Acquisition Cost</span>
            <strong>{formatCurrency(asset.acquisitionCost)}</strong>
          </div>
          <div>
            <span>Warranty Expiry</span>
            <strong>{asset.warrantyExpiry || "—"}</strong>
          </div>
        </div>

        {asset.notes && (
          <div className="asset-details-note">
            <span>Notes</span>
            <p>{asset.notes}</p>
          </div>
        )}

        <footer className="asset-details-drawer__footer">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            leftIcon={<AssetIcon name="edit" size={15} />}
            onClick={() => onEdit(asset)}
          >
            Edit Asset
          </Button>
        </footer>
      </aside>
    </>
  );
}
