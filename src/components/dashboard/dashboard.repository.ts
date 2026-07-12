import type { DashboardData } from "./dashboard.types";
import { dummyDashboardData } from "./dashboard.data";

import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

/**
 * Single dashboard data entry point.
 */
export async function getDashboardData(): Promise<DashboardData> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return dummyDashboardData;

  const payload = verifyToken(token);
  if (!payload?.sub) return dummyDashboardData;

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    include: {
      employees: true,
    },
  });

  if (!user) return dummyDashboardData;

  const name =
    user.name ||
    (user.employees
      ? `${user.employees.first_name} ${user.employees.last_name}`
      : user.email);

  return {
    ...dummyDashboardData,
    user: {
      name,
      role: user.role,
    },
  };
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
