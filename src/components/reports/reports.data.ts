import type { ReportsData } from "./reports.types";

export const dummyReportsData: ReportsData = {
  user: {
    name: "Admin User",
    role: "Administrator",
  },

  utilizationByDepartment: [
    { label: "IT", value: 72 },
    { label: "Ops", value: 88 },
    { label: "HR", value: 61 },
    { label: "Finance", value: 53 },
    { label: "R&D", value: 76 },
  ],

  maintenanceFrequency: [
    { label: "Jan", value: 2 },
    { label: "Feb", value: 5 },
    { label: "Mar", value: 4 },
    { label: "Apr", value: 7 },
    { label: "May", value: 5 },
    { label: "Jun", value: 9 },
  ],

  mostUsedAssets: [
    "Room B2: 34 bookings this month",
    "Van AF-343: 21 trips this month",
    "Projector AF-335: 18 uses",
  ],

  idleAssets: [
    "Camera AF-0301: unused 60+ days",
    "Chair AF-0410: unused 45 days",
  ],

  dueMaintenance: [
    "Forklift AF-0087: service due in 5 days",
    "Laptop AF-0020: 4 years old, nearing retirement",
  ],

  bookingHeatmap: [
    [2, 4, 6, 8, 5],
    [3, 6, 9, 7, 4],
    [1, 5, 8, 6, 3],
    [2, 7, 10, 8, 5],
    [1, 4, 7, 5, 2],
  ],
};
