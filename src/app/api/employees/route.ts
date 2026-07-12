import { type NextRequest } from "next/server";

import { ok } from "@/lib/api-response";
import { handleRouteError } from "@/lib/handle-route-error";
import { searchParamsToObject } from "@/lib/request";
import { listEmployees } from "@/repositories/organization.repository";
import { directoryQuerySchema } from "@/schemas/organization";
import { requireApiAuth } from "@/server/auth/require-auth";

export async function GET(request: NextRequest) {
  try {
    await requireApiAuth(request, ["SUPER_ADMIN", "ADMIN", "MANAGER"]);

    const query = directoryQuerySchema.parse(searchParamsToObject(request));
    const data = await listEmployees(query);

    return ok(data);
  } catch (error) {
    return handleRouteError(error, "[GET /api/employees]");
  }
}
