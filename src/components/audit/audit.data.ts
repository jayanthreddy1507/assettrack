import type { AuditData } from "./audit.types";

export const dummyAuditData: AuditData = {
  user: {
    name: "Admin User",
    role: "Administrator",
  },

  auditorOptions: [
    "A. Rao",
    "S. Iqbal",
    "Neha Patel",
    "Arjun Nair",
  ],

  cycles: [
    {
      id: "audit-1",
      name: "Q3 Audit - Engineering",
      scope: "Engineering Department",
      auditors: ["A. Rao", "S. Iqbal"],
      startDate: "01 Jul 2025",
      endDate: "15 Jul 2025",
      status: "IN_PROGRESS",
      items: [
        {
          id: "audit-item-1",
          assetId: "asset-1",
          assetTag: "AF-0003",
          assetName: "Dell Laptop",
          expectedLocation: "Desk E12",
          verification: "VERIFIED",
        },
        {
          id: "audit-item-2",
          assetId: "asset-2",
          assetTag: "AF-9921",
          assetName: "Office Chair",
          expectedLocation: "Desk E14",
          verification: "MISSING",
          notes: "Not found during physical verification.",
        },
        {
          id: "audit-item-3",
          assetId: "asset-3",
          assetTag: "AF-9838",
          assetName: "Monitor",
          expectedLocation: "Desk E15",
          verification: "DAMAGED",
          notes: "Display panel cracked.",
        },
      ],
    },
    {
      id: "audit-2",
      name: "Q2 2025 - All Assets",
      scope: "All Departments",
      auditors: ["A. Rao", "S. Iqbal", "Neha Patel", "Arjun Nair"],
      startDate: "01 Jun 2025",
      endDate: "15 Jun 2025",
      status: "SCHEDULED",
      items: [],
    },
    {
      id: "audit-3",
      name: "Apr 2025 - Vehicles",
      scope: "Vehicles",
      auditors: ["Neha Patel", "Arjun Nair"],
      startDate: "10 Apr 2025",
      endDate: "15 Apr 2025",
      status: "COMPLETED",
      items: [],
    },
    {
      id: "audit-4",
      name: "Mar 2025 - Furniture",
      scope: "Furniture",
      auditors: ["A. Rao", "S. Iqbal"],
      startDate: "05 Mar 2025",
      endDate: "12 Mar 2025",
      status: "COMPLETED",
      items: [],
    },
  ],
};
