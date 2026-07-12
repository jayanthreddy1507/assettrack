import type { NotificationsData } from "./notifications.types";

export const dummyNotificationsData: NotificationsData = {
  user: {
    name: "Priya Sharma",
    role: "Employee",
  },

  notifications: [
    {
      id: "notification-1",
      category: "ASSET",
      title: "Laptop AF-0014 assigned to Priya Sharma",
      description: "Asset allocation completed successfully.",
      timestamp: "2m ago",
      read: false,
    },
    {
      id: "notification-2",
      category: "APPROVAL",
      title: "Maintenance request AF-0055 approved",
      description: "The asset is now under maintenance.",
      timestamp: "18m ago",
      read: false,
    },
    {
      id: "notification-3",
      category: "BOOKING",
      title: "Booking confirmed: Room B2, 2:00 to 3:00 PM",
      description: "A reminder will be sent before the slot.",
      timestamp: "1h ago",
      read: true,
    },
    {
      id: "notification-4",
      category: "APPROVAL",
      title: "Transfer approved: AF-0033 to Facilities",
      description: "The transfer can now be completed.",
      timestamp: "3h ago",
      read: true,
    },
    {
      id: "notification-5",
      category: "ALERT",
      title: "Overdue return: AF-0021 was due 3 days ago",
      description: "Follow-up is required.",
      timestamp: "1d ago",
      read: false,
    },
    {
      id: "notification-6",
      category: "AUDIT",
      title: "Audit discrepancy flagged: AF-0088 damaged",
      description: "A discrepancy report was generated.",
      timestamp: "2d ago",
      read: true,
    },
  ],
};
