import "server-only";

import { prisma } from "@/lib/prisma";
import type {
  AssetQueryInput,
  CreateAssetInput,
  UpdateAssetInput,
} from "@/schemas/asset";

function toAssetWhere(query: AssetQueryInput) {
  return {
    deletedAt: null,
    ...(query.status ? { status: query.status } : {}),
    ...(query.condition ? { condition: query.condition } : {}),
    ...(query.categoryId ? { categoryId: query.categoryId } : {}),
    ...(query.departmentId ? { departmentId: query.departmentId } : {}),
    ...(query.is_bookable === undefined ? {} : { is_bookable: query.is_bookable }),
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: "insensitive" as const } },
            {
              assetTag: {
                contains: query.search,
                mode: "insensitive" as const,
              },
            },
            {
              serialNumber: {
                contains: query.search,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),
  };
}

const assetInclude = {
  category: {
    select: {
      id: true,
      name: true,
      icon: true,
    },
  },
  department: {
    select: {
      id: true,
      name: true,
      code: true,
    },
  },
} as const;

export async function listAssets(query: AssetQueryInput) {
  const skip = (query.page - 1) * query.limit;
  const where = toAssetWhere(query);

  const [items, total] = await prisma.$transaction([
    prisma.asset.findMany({
      where,
      include: assetInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take: query.limit,
    }),
    prisma.asset.count({ where }),
  ]);

  return {
    items,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

export function getAssetById(id: string) {
  return prisma.asset.findFirst({
    where: { id, deletedAt: null },
    include: assetInclude,
  });
}

export function createAsset(data: CreateAssetInput, userId: string) {
  return prisma.asset.create({
    data: {
      ...data,
      created_by: userId,
      updated_by: userId,
    },
    include: assetInclude,
  });
}

export function updateAsset(id: string, data: UpdateAssetInput, userId: string) {
  return prisma.asset.update({
    where: { id },
    data: {
      ...data,
      updated_by: userId,
    },
    include: assetInclude,
  });
}

export function softDeleteAsset(id: string, userId: string) {
  return prisma.asset.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      updated_by: userId,
    },
  });
}
