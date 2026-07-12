import { type NextRequest } from "next/server";
import { z } from "zod";

import { ok } from "@/lib/api-response";
import { handleRouteError } from "@/lib/handle-route-error";
import { parseJsonBody } from "@/lib/request";
import {
  getNotificationsData,
  markAllNotificationsRead,
  updateNotification,
} from "@/repositories/workflows.repository";
import { requireApiAuth } from "@/server/auth/require-auth";

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("toggle"), id: z.uuid(), read: z.boolean() }),
  z.object({ action: z.literal("markAllRead") }),
]);

export async function GET(request: NextRequest) {
  try {
    await requireApiAuth(request);
    return ok(await getNotificationsData());
  } catch (error) {
    return handleRouteError(error, "[GET /api/notifications]");
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireApiAuth(request);
    const input = await parseJsonBody(request, actionSchema);
    if (input.action === "toggle")
      await updateNotification(input.id, input.read, user.id);
    if (input.action === "markAllRead") await markAllNotificationsRead(user.id);
    return ok(await getNotificationsData(), "Notifications updated.");
  } catch (error) {
    return handleRouteError(error, "[PATCH /api/notifications]");
  }
}
