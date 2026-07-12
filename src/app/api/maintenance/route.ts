import { type NextRequest } from "next/server";
import { z } from "zod";

import { created, ok } from "@/lib/api-response";
import { handleRouteError } from "@/lib/handle-route-error";
import { parseJsonBody } from "@/lib/request";
import {
  advanceMaintenance,
  createMaintenance,
  getMaintenanceData,
} from "@/repositories/workflows.repository";
import { requireApiAuth } from "@/server/auth/require-auth";

const actionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("create"),
    assetId: z.uuid(),
    issue: z.string().trim().min(1).max(300),
    description: z.string().trim().max(2000).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  }),
  z.object({ action: z.literal("advance"), id: z.uuid() }),
]);

export async function GET(request: NextRequest) {
  try {
    await requireApiAuth(request);
    return ok(await getMaintenanceData());
  } catch (error) {
    return handleRouteError(error, "[GET /api/maintenance]");
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireApiAuth(request);
    const input = await parseJsonBody(request, actionSchema);
    if (input.action === "create") await createMaintenance(input, user.id);
    if (input.action === "advance") {
      await requireApiAuth(request, ["SUPER_ADMIN", "ADMIN", "MANAGER", "TECHNICIAN"]);
      await advanceMaintenance(input.id, user.id);
    }
    return created(await getMaintenanceData(), "Maintenance workflow updated.");
  } catch (error) {
    return handleRouteError(error, "[POST /api/maintenance]");
  }
}
