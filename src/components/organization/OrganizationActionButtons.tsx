import { OrganizationIcon } from "./OrganizationIcons";

export interface OrganizationActionButtonsProps {
  label: string;
  inactive?: boolean;
  onEdit: () => void;
  onDeactivate: () => void;
}

export function OrganizationActionButtons({
  label,
  inactive = false,
  onEdit,
  onDeactivate,
}: OrganizationActionButtonsProps) {
  return (
    <div className="organization-row-actions">
      <button
        type="button"
        className="organization-row-action"
        aria-label={`Edit ${label}`}
        title={`Edit ${label}`}
        onClick={onEdit}
      >
        <OrganizationIcon name="edit" size={15} />
      </button>

      <button
        type="button"
        className="organization-row-action organization-row-action--danger"
        aria-label={
          inactive ? `Activate ${label}` : `Deactivate ${label}`
        }
        title={
          inactive ? `Activate ${label}` : `Deactivate ${label}`
        }
        onClick={onDeactivate}
      >
        <OrganizationIcon name="deactivate" size={15} />
      </button>
    </div>
  );
}
