import type { AllocationData } from "./allocation.types";

export const dummyAllocationData: AllocationData = {
  user: {
    name: "Asset Manager",
    role: "Asset Manager",
  },

  assets: [
    {
      id: "asset-1",
      assetTag: "AF-0114",
      name: "Laptop Dell XPS 13",
      categoryName: "Electronics",
      status: "ASSIGNED",
      currentHolderId: "user-priya",
      currentHolderName: "Priya Sharma",
      currentHolderDepartment: "Engineering",
      allocatedSince: "05/05/2025",
      expectedReturn: "15/05/2025",
    },
    {
      id: "asset-2",
      assetTag: "AF-0092",
      name: "iPhone 14",
      categoryName: "Electronics",
      status: "ASSIGNED",
      currentHolderId: "user-rahul",
      currentHolderName: "Rahul Verma",
      currentHolderDepartment: "Operations",
      allocatedSince: "08/05/2025",
      expectedReturn: "20/05/2025",
    },
    {
      id: "asset-3",
      assetTag: "AF-0045",
      name: "Toyota Innova",
      categoryName: "Vehicles",
      status: "AVAILABLE",
    },
    {
      id: "asset-4",
      assetTag: "AF-0031",
      name: "HP LaserJet Pro",
      categoryName: "Office Equipment",
      status: "AVAILABLE",
    },
  ],

  people: [
    {
      id: "user-priya",
      name: "Priya Sharma",
      departmentName: "Engineering",
      role: "Employee",
    },
    {
      id: "user-rahul",
      name: "Rahul Verma",
      departmentName: "Operations",
      role: "Employee",
    },
    {
      id: "user-neha",
      name: "Neha Patel",
      departmentName: "Operations",
      role: "Employee",
    },
    {
      id: "user-arjun",
      name: "Arjun Nair",
      departmentName: "Research & Development",
      role: "Manager",
    },
  ],

  transfers: [
    {
      id: "transfer-1",
      assetId: "asset-2",
      assetTag: "AF-0092",
      assetName: "iPhone 14",
      fromUserId: "user-rahul",
      fromUserName: "Rahul Verma",
      toUserId: "user-neha",
      toUserName: "Neha Patel",
      reason: "Temporary assignment for field testing.",
      requestedOn: "12 May 2025",
      status: "REQUESTED",
    },
  ],

  returns: [
    {
      id: "return-1",
      assetId: "asset-4",
      assetTag: "AF-0031",
      assetName: "HP LaserJet Pro",
      holderName: "Arjun Nair",
      returnedOn: "04 May 2025",
      condition: "GOOD",
      notes: "Returned with all accessories.",
    },
  ],

  history: [
    {
      id: "history-1",
      assetId: "asset-1",
      assetTag: "AF-0114",
      assetName: "Laptop Dell XPS 13",
      action: "ALLOCATED",
      description: "Allocated to Priya Sharma - Engineering",
      date: "12 Mar 2025",
    },
    {
      id: "history-2",
      assetId: "asset-1",
      assetTag: "AF-0114",
      assetName: "Laptop Dell XPS 13",
      action: "RETURNED",
      description: "Returned by Arjun Nair - condition: good",
      date: "04 Jan 2025",
    },
    {
      id: "history-3",
      assetId: "asset-2",
      assetTag: "AF-0092",
      assetName: "iPhone 14",
      action: "TRANSFERRED",
      description: "Transferred from Priya Sharma to Rahul Verma",
      date: "28 Apr 2025",
    },
  ],
};
