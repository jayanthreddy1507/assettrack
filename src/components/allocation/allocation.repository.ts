import { dummyAllocationData } from "./allocation.data";
import type { AllocationData } from "./allocation.types";

export async function getAllocationData(): Promise<AllocationData> {
  return structuredClone(dummyAllocationData);
}

/*
Prisma-ready structure:

export async function getAllocationData(): Promise<AllocationData> {
  const [assets, people, transfers, returns, history] = await Promise.all([
    prisma.asset.findMany({
      where: { deletedAt: null },
      include: {
        category: true,
        assignedTo: {
          include: { department: true },
        },
      },
    }),
    prisma.user.findMany({
      where: {
        deletedAt: null,
        status: "ACTIVE",
      },
      include: { department: true },
    }),
    prisma.transferRequest.findMany({
      include: {
        asset: true,
        fromUser: true,
        toUser: true,
      },
    }),
    prisma.assetReturn.findMany({
      include: {
        asset: true,
        holder: true,
      },
    }),
    prisma.allocationHistory.findMany({
      include: { asset: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return { ...mappedData };
}

Your current Prisma schema may not yet include transfer requests,
asset returns, allocation history, or expected-return fields.
Keep the dummy repository until those models are added.
*/
