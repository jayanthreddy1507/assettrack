import type { NotificationCategory } from "./notifications.types";

export type NotificationFilter =
  | "ALL"
  | NotificationCategory;

export function NotificationFilters({
  active,
  onChange,
}: {
  active: NotificationFilter;
  onChange: (value: NotificationFilter) => void;
}) {
  const filters: NotificationFilter[] = [
    "ALL",
    "ALERT",
    "APPROVAL",
    "BOOKING",
  ];

  return (
    <div className="notification-filters">
      {filters.map((filter) => (
        <button
          key={filter}
          type="button"
          data-active={active === filter}
          onClick={() => onChange(filter)}
        >
          {filter === "ALL"
            ? "All"
            : filter.charAt(0) +
              filter.slice(1).toLowerCase() +
              (filter === "APPROVAL" ? "s" : filter === "BOOKING" ? "s" : "s")}
        </button>
      ))}
    </div>
  );
}
