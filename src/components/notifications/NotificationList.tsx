import type { NotificationItem } from "./notifications.types";

export function NotificationList({
  notifications,
  onToggleRead,
}: {
  notifications: NotificationItem[];
  onToggleRead: (id: string) => void;
}) {
  return (
    <div className="notification-list">
      {notifications.map((item) => (
        <button
          key={item.id}
          type="button"
          className="notification-row"
          data-category={item.category}
          data-read={item.read}
          onClick={() => onToggleRead(item.id)}
        >
          <span className="notification-dot" />
          <div>
            <strong>{item.title}</strong>
            <p>{item.description}</p>
          </div>
          <time>{item.timestamp}</time>
        </button>
      ))}
    </div>
  );
}
