"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui";
import { NotificationFilters, type NotificationFilter } from "./NotificationFilters";
import { NotificationList } from "./NotificationList";
import type {
  NotificationItem,
  NotificationsData,
} from "./notifications.types";

export function NotificationsWorkspace({
  data,
}: {
  data: NotificationsData;
}) {
  const [notifications, setNotifications] = useState(
    data.notifications
  );
  const [filter, setFilter] =
    useState<NotificationFilter>("ALL");

  const visible = useMemo(
    () =>
      filter === "ALL"
        ? notifications
        : notifications.filter(
            (item) => item.category === filter
          ),
    [filter, notifications]
  );

  function toggleRead(id: string) {
    setNotifications((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, read: !item.read }
          : item
      )
    );
  }

  function markAllRead() {
    setNotifications((current) =>
      current.map((item) => ({ ...item, read: true }))
    );
  }

  return (
    <div className="notifications-content">
      <header className="notifications-page-header">
        <div>
          <h1>Notifications</h1>
          <p>Stay updated with important activities.</p>
        </div>
        <Button variant="secondary" onClick={markAllRead}>
          Mark all as read
        </Button>
      </header>

      <section className="notifications-workspace">
        <NotificationFilters
          active={filter}
          onChange={setFilter}
        />
        <NotificationList
          notifications={visible}
          onToggleRead={toggleRead}
        />
      </section>
    </div>
  );
}
