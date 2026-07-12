import { dummyAssetRegistryData } from "./asset.data";
import type { AssetRegistryData } from "./asset.types";

export async function getAssetRegistryData(): Promise<AssetRegistryData> {
  return structuredClone(dummyAssetRegistryData);
}

/*
Example Prisma implementation:

import { prisma } from "@/lib/prisma";

export async function getAssetRegistryData(): Promise<AssetRegistryData> {
  const [assets, categories, departments, employees] = await Promise.all([
    prisma.asset.findMany({
      where: { deletedAt: null },
      include: {
        category: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),

    prisma.category.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),

    prisma.department.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),

    prisma.user.findMany({
      where: {
        deletedAt: null,
        status: "ACTIVE",
      },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return {
    user: {
      name: "Asset Manager",
      role: "Asset Manager",
    },

    categories,
    departments,
    employees,

    assets: assets.map((asset) => ({
      id: asset.id,
      assetTag: asset.assetTag,
      name: asset.name,
      serialNumber: asset.serialNumber ?? undefined,
      description: asset.description ?? undefined,
      categoryId: asset.category?.id,
      categoryName: asset.category?.name,
      status: asset.status,
      condition: asset.condition,
      location: asset.location ?? undefined,
      departmentId: asset.department?.id,
      departmentName: asset.department?.name,
      assignedToId: asset.assignedTo?.id,
      assignedToName: asset.assignedTo?.name,
      acquisitionDate: asset.acquisitionDate
        ? asset.acquisitionDate.toISOString().slice(0, 10)
        : undefined,
      acquisitionCost: asset.acquisitionCost
        ? Number(asset.acquisitionCost)
        : undefined,
      manufacturer: asset.manufacturer ?? undefined,
      model: asset.model ?? undefined,
      warrantyExpiry: asset.warrantyExpiry
        ? asset.warrantyExpiry.toISOString().slice(0, 10)
        : undefined,
      isBookable: asset.isBookable,
      notes: asset.notes ?? undefined,
    })),
  };
}
*/
