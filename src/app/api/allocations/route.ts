import { type NextRequest } from "next/server";
import { z } from "zod";

import { ok } from "@/lib/api-response";
import { handleRouteError } from "@/lib/handle-route-error";
import { parseJsonBody } from "@/lib/request";
import {
  allocateAsset,
  createTransfer,
  getAllocationData,
  returnAsset,
  setTransferStatus,
} from "@/repositories/workflows.repository";
import { requireApiAuth } from "@/server/auth/require-auth";

const actionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("allocate"),
    assetId: z.uuid(),
    employeeId: z.uuid(),
    expectedReturn: z.string().date().optional(),
  }),
  z.object({
    action: z.literal("return"),
    assetId: z.uuid(),
    condition: z.enum(["NEW", "GOOD", "FAIR", "POOR", "DAMAGED"]),
    notes: z.string().trim().max(2000).optional(),
  }),
  z.object({
    action: z.literal("createTransfer"),
    assetId: z.uuid(),
    toEmployeeId: z.uuid(),
    reason: z.string().trim().min(1).max(1000),
  }),
  z.object({
    action: z.literal("setTransferStatus"),
    id: z.uuid(),
    status: z.enum(["APPROVED", "REJECTED", "COMPLETED", "CANCELLED"]),
  }),
]);

export async function GET(request: NextRequest) {
  try {
    await requireApiAuth(request);
    return ok(await getAllocationData());
  } catch (error) {
    return handleRouteError(error, "[GET /api/allocations]");
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireApiAuth(request, ["SUPER_ADMIN", "ADMIN", "MANAGER"]);
    const input = await parseJsonBody(request, actionSchema);

    if (input.action === "allocate")
      await allocateAsset(input.assetId, input.employeeId, input.expectedReturn, user.id);
    if (input.action === "return")
      await returnAsset(input.assetId, input.condition, input.notes, user.id);
    if (input.action === "createTransfer")
      await createTransfer(input.assetId, input.toEmployeeId, input.reason);
    if (input.action === "setTransferStatus")
      await setTransferStatus(input.id, input.status, user.id);

    return ok(await getAllocationData(), "Allocation workflow updated.");
  } catch (error) {
    return handleRouteError(error, "[POST /api/allocations]");
  }
}
