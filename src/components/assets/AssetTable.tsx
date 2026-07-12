import type { AssetRecord } from "./asset.types";
import { AssetIcon } from "./AssetIcons";
import { AssetStatusBadge } from "./AssetStatusBadge";

export interface AssetTableProps {
  assets: AssetRecord[];
  onView: (asset: AssetRecord) => void;
  onEdit: (asset: AssetRecord) => void;
}

export function AssetTable({
  assets,
  onView,
  onEdit,
}: AssetTableProps) {
  return (
    <div className="asset-table-scroll">
      <table className="asset-table">
        <thead>
          <tr>
            <th>Asset Tag</th>
            <th>Asset Name</th>
            <th>Category</th>
            <th>Status</th>
            <th>Condition</th>
            <th>Location</th>
            <th>Allocated To</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {assets.length ? (
            assets.map((asset) => (
              <tr key={asset.id}>
                <td>
                  <span className="asset-tag">{asset.assetTag}</span>
                </td>
                <td>
                  <div className="asset-name-cell">
                    <strong>{asset.name}</strong>
                    <span>{asset.serialNumber || "No serial number"}</span>
                  </div>
                </td>
                <td>{asset.categoryName || "Uncategorized"}</td>
                <td>
                  <AssetStatusBadge status={asset.status} />
                </td>
                <td>{asset.condition}</td>
                <td>{asset.location || "—"}</td>
                <td>{asset.assignedToName || "—"}</td>
                <td>
                  <div className="asset-row-actions">
                    <button
                      type="button"
                      aria-label={`View ${asset.name}`}
                      title={`View ${asset.name}`}
                      onClick={() => onView(asset)}
                    >
                      <AssetIcon name="eye" size={15} />
                    </button>

                    <button
                      type="button"
                      aria-label={`Edit ${asset.name}`}
                      title={`Edit ${asset.name}`}
                      onClick={() => onEdit(asset)}
                    >
                      <AssetIcon name="edit" size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="asset-empty-cell">
                No assets match the selected filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
