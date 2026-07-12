import { Select } from "@/components/ui";
import type { BookingResource } from "./booking.types";

export interface ResourceSelectorProps {
  resourceId: string;
  resources: BookingResource[];
  onChange: (value: string) => void;
}

export function ResourceSelector({
  resourceId,
  resources,
  onChange,
}: ResourceSelectorProps) {
  return (
    <div className="booking-resource-selector">
      <Select
        id="booking-resource"
        label="Select Resource"
        value={resourceId}
        options={resources.map((resource) => ({
          label: resource.name,
          value: resource.id,
        }))}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
