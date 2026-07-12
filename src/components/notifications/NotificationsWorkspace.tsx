"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui";
import { apiRequest } from "@/lib/api-client";
import { NotificationFilters, type NotificationFilter } from "./NotificationFilters";
import { NotificationList } from "./NotificationList";
import type { NotificationItem, NotificationsData } from "./notifications.types";

export function NotificationsWorkspace({ data }: { data: NotificationsData }) {
  const [notifications, setNotifications] = useState(data.notifications);
  const [filter, setFilter] = useState<NotificationFilter>("ALL");

  const visible = useMemo(
    () =>
      filter === "ALL"
        ? notifications
        : notifications.filter((item) => item.category === filter),
    [filter, notifications],
  );

  async function mutate(body: unknown) {
    try {
      const next = await apiRequest<NotificationsData>("/api/notifications", {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      setNotifications(next.notifications);
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Notifications could not be updated.",
      );
    }
  }

  function toggleRead(id: string) {
    const notification = notifications.find((item) => item.id === id);
    if (notification) void mutate({ action: "toggle", id, read: !notification.read });
  }

  function markAllRead() {
    void mutate({ action: "markAllRead" });
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
        <NotificationFilters active={filter} onChange={setFilter} />
        <NotificationList notifications={visible} onToggleRead={toggleRead} />
      </section>
    </div>
  );
}
