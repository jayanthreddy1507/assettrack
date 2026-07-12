import { type NextRequest } from "next/server";

import { fail, noContent, ok } from "@/lib/api-response";
import { handleRouteError } from "@/lib/handle-route-error";
import { parseJsonBody } from "@/lib/request";
import {
  getAssetById,
  softDeleteAsset,
  updateAsset,
} from "@/repositories/assets.repository";
import { updateAssetSchema } from "@/schemas/asset";
import { uuidSchema } from "@/schemas/common";
import { requireApiAuth } from "@/server/auth/require-auth";

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function parseId(context: RouteContext) {
  const { id } = await context.params;
  return uuidSchema.parse(id);
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    await requireApiAuth(request);

    const id = await parseId(context);
    const asset = await getAssetById(id);

    if (!asset) {
      return fail("Asset not found.", 404);
    }

    return ok({ asset });
  } catch (error) {
    return handleRouteError(error, "[GET /api/assets/:id]");
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireApiAuth(request, [
      "SUPER_ADMIN",
      "ADMIN",
      "MANAGER",
      "TECHNICIAN",
    ]);
    const id = await parseId(context);
    const input = await parseJsonBody(request, updateAssetSchema);

    const existing = await getAssetById(id);
    if (!existing) {
      return fail("Asset not found.", 404);
    }

    const asset = await updateAsset(id, input, user.id);
    return ok({ asset }, "Asset updated successfully.");
  } catch (error) {
    return handleRouteError(error, "[PATCH /api/assets/:id]");
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireApiAuth(request, ["SUPER_ADMIN", "ADMIN"]);
    const id = await parseId(context);

    const existing = await getAssetById(id);
    if (!existing) {
      return fail("Asset not found.", 404);
    }

    await softDeleteAsset(id, user.id);
    return noContent();
  } catch (error) {
    return handleRouteError(error, "[DELETE /api/assets/:id]");
  }
}
