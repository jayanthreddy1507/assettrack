import { type NextRequest } from "next/server";
import { z } from "zod";

import { created, ok } from "@/lib/api-response";
import { handleRouteError } from "@/lib/handle-route-error";
import { parseJsonBody } from "@/lib/request";
import {
  closeAudit,
  createAudit,
  getAuditData,
  updateAuditItem,
} from "@/repositories/workflows.repository";
import { requireApiAuth } from "@/server/auth/require-auth";

const actionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("create"),
    name: z.string().trim().min(1).max(200),
    scope: z.string().trim().min(1).max(200),
    auditorName: z.string().trim().min(1).max(200),
    startDate: z.string().date(),
    endDate: z.string().date(),
  }),
  z.object({
    action: z.literal("verify"),
    itemId: z.uuid(),
    verification: z.enum(["PENDING", "VERIFIED", "MISSING", "DAMAGED"]),
  }),
  z.object({ action: z.literal("close"), cycleId: z.uuid() }),
]);

export async function GET(request: NextRequest) {
  try {
    await requireApiAuth(request, ["SUPER_ADMIN", "ADMIN", "MANAGER", "AUDITOR"]);
    return ok(await getAuditData());
  } catch (error) {
    return handleRouteError(error, "[GET /api/audits]");
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireApiAuth(request, [
      "SUPER_ADMIN",
      "ADMIN",
      "MANAGER",
      "AUDITOR",
    ]);
    const input = await parseJsonBody(request, actionSchema);
    if (input.action === "create") await createAudit(input, user.id);
    if (input.action === "verify")
      await updateAuditItem(input.itemId, input.verification);
    if (input.action === "close") await closeAudit(input.cycleId);
    return created(await getAuditData(), "Audit workflow updated.");
  } catch (error) {
    return handleRouteError(error, "[POST /api/audits]");
  }
}
