import { dummyMaintenanceData } from "./maintenance.data";
import type { MaintenanceData } from "./maintenance.types";

export async function getMaintenanceData(): Promise<MaintenanceData> {
  return structuredClone(dummyMaintenanceData);
}

/*
Prisma-ready example:

export async function getMaintenanceData(): Promise<MaintenanceData> {
  const [assets, technicians, requests] = await Promise.all([
    prisma.asset.findMany({
      where: { deletedAt: null },
      select: { id: true, assetTag: true, name: true },
    }),

    prisma.user.findMany({
      where: {
        deletedAt: null,
        role: "TECHNICIAN",
        status: "ACTIVE",
      },
      select: { id: true, name: true },
    }),

    prisma.maintenanceRequest.findMany({
      include: {
        asset: true,
        requestedBy: true,
        approvedBy: true,
        technician: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    user: {
      name: "Employee",
      role: "Employee",
    },
    assets,
    technicians,
    requests: requests.map(...),
  };
}

If your current Prisma schema does not yet contain a maintenance request
model, keep using the dummy repository until it is added.
*/
