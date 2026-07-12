import { type NextRequest } from "next/server";
import { z } from "zod";

import { created, ok } from "@/lib/api-response";
import { handleRouteError } from "@/lib/handle-route-error";
import { prisma } from "@/lib/prisma";
import { parseJsonBody } from "@/lib/request";
import { getAssetRegistryData } from "@/repositories/workflows.repository";
import { requireApiAuth } from "@/server/auth/require-auth";

const assetSchema = z.object({
  id: z.string().optional(),
  assetTag: z.string().trim().min(2),
  name: z.string().trim().min(2),
  serialNumber: z.string().trim().optional(),
  description: z.string().trim().optional(),
  categoryId: z.uuid(),
  status: z.enum([
    "ACTIVE",
    "AVAILABLE",
    "ASSIGNED",
    "IN_MAINTENANCE",
    "DECOMMISSIONED",
    "LOST",
    "STOLEN",
    "RESERVED",
  ]),
  condition: z.enum(["NEW", "GOOD", "FAIR", "POOR", "DAMAGED"]),
  location: z.string().trim().optional(),
  departmentId: z.uuid().optional(),
  acquisitionDate: z.string().date().optional(),
  acquisitionCost: z.number().nonnegative().optional(),
  manufacturer: z.string().trim().optional(),
  model: z.string().trim().optional(),
  warrantyExpiry: z.string().date().optional(),
  isBookable: z.boolean(),
});

function databaseStatus(status: z.infer<typeof assetSchema>["status"]) {
  if (status === "ASSIGNED") return "ALLOCATED" as const;
  if (status === "DECOMMISSIONED" || status === "ACTIVE")
    return status === "ACTIVE" ? ("AVAILABLE" as const) : ("RETIRED" as const);
  return status;
}

export async function GET(request: NextRequest) {
  try {
    await requireApiAuth(request);
    return ok(await getAssetRegistryData());
  } catch (error) {
    return handleRouteError(error, "[GET /api/assets/registry]");
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireApiAuth(request, ["SUPER_ADMIN", "ADMIN", "MANAGER"]);
    const input = await parseJsonBody(request, assetSchema);
    const data = {
      assetTag: input.assetTag,
      name: input.name,
      serialNumber: input.serialNumber || null,
      description: input.description || null,
      categoryId: input.categoryId,
      status: databaseStatus(input.status),
      condition: input.condition,
      location: input.location || null,
      departmentId: input.departmentId || null,
      purchaseDate: input.acquisitionDate
        ? new Date(`${input.acquisitionDate}T00:00:00.000Z`)
        : null,
      purchase_cost: input.acquisitionCost,
      manufacturer: input.manufacturer || null,
      vendor: input.model || null,
      warrantyExpiry: input.warrantyExpiry
        ? new Date(`${input.warrantyExpiry}T00:00:00.000Z`)
        : null,
      is_bookable: input.isBookable,
      updated_by: user.id,
    };
    if (input.id && !input.id.startsWith("asset-")) {
      await prisma.asset.update({ where: { id: input.id }, data });
    } else {
      await prisma.asset.create({ data: { ...data, created_by: user.id } });
    }
    return created(await getAssetRegistryData(), "Asset saved.");
  } catch (error) {
    return handleRouteError(error, "[POST /api/assets/registry]");
  }
}
