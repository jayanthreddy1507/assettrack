import type { NextRequest } from "next/server";
import type { z } from "zod";

import { ApiError } from "@/lib/api-error";

export async function parseJsonBody<TSchema extends z.ZodType>(
  request: NextRequest,
  schema: TSchema,
): Promise<z.infer<TSchema>> {
  const body = await request.json().catch(() => {
    throw new ApiError(400, "Invalid JSON request body.");
  });

  return schema.parse(body);
}

export function searchParamsToObject(request: NextRequest) {
  return Object.fromEntries(request.nextUrl.searchParams.entries());
}
