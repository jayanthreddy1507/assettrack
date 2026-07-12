import type { DashboardUser } from "@/components/dashboard";

export type NotificationCategory =
  | "ALERT"
  | "APPROVAL"
  | "BOOKING"
  | "ASSET"
  | "AUDIT";

export interface NotificationItem {
  id: string;
  category: NotificationCategory;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}

export interface NotificationsData {
  user: DashboardUser;
  notifications: NotificationItem[];
}
