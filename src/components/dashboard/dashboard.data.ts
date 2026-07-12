import type { DashboardData } from "./dashboard.types";

/**
 * Temporary dashboard data used before Prisma is connected.
 *
 * The dashboard page reads through getDashboardData() instead of importing
 * this object directly. That means this file can be removed later without
 * changing any UI component.
 */
export const dummyDashboardData: DashboardData = {
  user: {
    name: "Priya Sharma",
    role: "Employee",
  },

  stats: [
    {
      id: "assets-available",
      label: "Assets Available",
      value: 128,
      meta: "12 more than last week",
      direction: "up",
      tone: "mint",
    },
    {
      id: "assets-allocated",
      label: "Assets Allocated",
      value: 342,
      meta: "8 more than last week",
      direction: "up",
      tone: "sky",
    },
    {
      id: "maintenance-today",
      label: "Maintenance Today",
      value: 5,
      meta: "2 fewer than yesterday",
      direction: "down",
      tone: "cream",
    },
    {
      id: "active-bookings",
      label: "Active Bookings",
      value: 18,
      meta: "3 more than yesterday",
      direction: "up",
      tone: "sage",
    },
    {
      id: "pending-transfers",
      label: "Pending Transfers",
      value: 7,
      meta: "2 more than last week",
      direction: "up",
      tone: "cream",
    },
    {
      id: "upcoming-returns",
      label: "Upcoming Returns",
      value: 12,
      meta: "Due within the next 7 days",
      direction: "neutral",
      tone: "mint",
    },
    {
      id: "overdue-returns",
      label: "Overdue Returns",
      value: 4,
      meta: "Require immediate follow-up",
      direction: "neutral",
      tone: "peach",
    },
  ],

  overdueReturns: [
    {
      id: "return-1",
      assetTag: "AF-0114",
      assetName: "Laptop Dell XPS 13",
      heldBy: "Priya Sharma",
      expectedReturn: "02 May 2025",
      daysOverdue: 5,
    },
    {
      id: "return-2",
      assetTag: "AF-0092",
      assetName: "iPhone 14",
      heldBy: "Rahul Verma",
      expectedReturn: "03 May 2025",
      daysOverdue: 4,
    },
    {
      id: "return-3",
      assetTag: "AF-0067",
      assetName: "Canon EOS 200D",
      heldBy: "Neha Patel",
      expectedReturn: "05 May 2025",
      daysOverdue: 2,
    },
    {
      id: "return-4",
      assetTag: "AF-0031",
      assetName: "HP LaserJet Pro",
      heldBy: "Mitesh Jain",
      expectedReturn: "01 May 2025",
      daysOverdue: 6,
    },
  ],

  recentActivity: [
    {
      id: "activity-1",
      title: "Laptop AF-0114 allocated",
      description: "Assigned to Priya Sharma from the IT department.",
      timestamp: "8 minutes ago",
      type: "asset",
    },
    {
      id: "activity-2",
      title: "Room B2 booking confirmed",
      description: "Meeting room reserved from 2:00 PM to 3:00 PM.",
      timestamp: "24 minutes ago",
      type: "booking",
    },
    {
      id: "activity-3",
      title: "Projector AF-0062 maintenance resolved",
      description: "Repair work completed and the asset is available again.",
      timestamp: "1 hour ago",
      type: "maintenance",
    },
    {
      id: "activity-4",
      title: "Transfer request approved",
      description: "AF-0092 can now be transferred to Rahul Verma.",
      timestamp: "2 hours ago",
      type: "transfer",
    },
    {
      id: "activity-5",
      title: "Quarterly audit assigned",
      description: "The IT asset audit was assigned to two auditors.",
      timestamp: "Yesterday",
      type: "audit",
    },
  ],
};
