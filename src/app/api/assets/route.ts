import { type NextRequest } from "next/server";

import { created, ok } from "@/lib/api-response";
import { handleRouteError } from "@/lib/handle-route-error";
import { parseJsonBody, searchParamsToObject } from "@/lib/request";
import { createAsset, listAssets } from "@/repositories/assets.repository";
import { assetQuerySchema, createAssetSchema } from "@/schemas/asset";
import { requireApiAuth } from "@/server/auth/require-auth";

export async function GET(request: NextRequest) {
  try {
    await requireApiAuth(request);

    const query = assetQuerySchema.parse(searchParamsToObject(request));
    const data = await listAssets(query);

    return ok(data);
  } catch (error) {
    return handleRouteError(error, "[GET /api/assets]");
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireApiAuth(request, ["SUPER_ADMIN", "ADMIN", "MANAGER"]);
    const input = await parseJsonBody(request, createAssetSchema);
    const asset = await createAsset(input, user.id);

    return created({ asset }, "Asset created successfully.");
  } catch (error) {
    return handleRouteError(error, "[POST /api/assets]");
  }
}
