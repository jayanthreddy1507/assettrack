import { type NextRequest } from "next/server";

import { created, ok } from "@/lib/api-response";
import { handleRouteError } from "@/lib/handle-route-error";
import { parseJsonBody, searchParamsToObject } from "@/lib/request";
import {
  createDepartment,
  listDepartments,
} from "@/repositories/organization.repository";
import { createDepartmentSchema, directoryQuerySchema } from "@/schemas/organization";
import { requireApiAuth } from "@/server/auth/require-auth";

export async function GET(request: NextRequest) {
  try {
    await requireApiAuth(request);

    const query = directoryQuerySchema.parse(searchParamsToObject(request));
    const data = await listDepartments(query);

    return ok(data);
  } catch (error) {
    return handleRouteError(error, "[GET /api/departments]");
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireApiAuth(request, ["SUPER_ADMIN", "ADMIN"]);

    const input = await parseJsonBody(request, createDepartmentSchema);
    const department = await createDepartment(input);

    return created({ department }, "Department created successfully.");
  } catch (error) {
    return handleRouteError(error, "[POST /api/departments]");
  }
}
