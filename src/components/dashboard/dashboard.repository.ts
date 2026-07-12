import type { DashboardData } from "./dashboard.types";
import { dummyDashboardData } from "./dashboard.data";

/**
 * Single dashboard data entry point.
 *
 * CURRENT:
 * Returns local dummy data so the UI can be tested without a database.
 *
 * LATER, AFTER PRISMA IS CONNECTED:
 * Replace the body of this function with Prisma queries. None of the
 * dashboard components or the page needs to change.
 */
export async function getDashboardData(): Promise<DashboardData> {
  return dummyDashboardData;
}

/*
Example Prisma implementation based on the supplied schema:

import { prisma } from "@/lib/prisma";

export async function getDashboardData(): Promise<DashboardData> {
  const now = new Date();
  const startOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const [
    availableAssets,
    allocatedAssets,
    maintenanceToday,
  ] = await Promise.all([
    prisma.asset.count({
      where: {
        status: "AVAILABLE",
        deletedAt: null,
      },
    }),
    prisma.asset.count({
      where: {
        status: "ASSIGNED",
        deletedAt: null,
      },
    }),
    prisma.asset.count({
      where: {
        status: "IN_MAINTENANCE",
        updatedAt: {
          gte: startOfDay,
          lt: endOfDay,
        },
        deletedAt: null,
      },
    }),
  ]);

  return {
    user: {
      name: "Current signed-in user",
      role: "EMPLOYEE",
    },
    stats: [
      {
        id: "assets-available",
        label: "Assets Available",
        value: availableAssets,
        meta: "Current available inventory",
        direction: "neutral",
        tone: "mint",
      },
      {
        id: "assets-allocated",
        label: "Assets Allocated",
        value: allocatedAssets,
        meta: "Currently assigned assets",
        direction: "neutral",
        tone: "sky",
      },
      {
        id: "maintenance-today",
        label: "Maintenance Today",
        value: maintenanceToday,
        meta: "Assets updated today",
        direction: "neutral",
        tone: "cream",
      },
    ],
    overdueReturns: [],
    recentActivity: [],
  };
}

Your current schema does not yet contain allocation history, transfers,
bookings, maintenance requests, audit events, or expected return dates.
Those dashboard values should be queried after those Prisma models are added.
*/
