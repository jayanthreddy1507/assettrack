import { ZodError } from "zod";

import { fail, validationError } from "@/lib/api-response";
import { isApiError } from "@/lib/api-error";

export function handleRouteError(error: unknown, label: string) {
  if (error instanceof ZodError) {
    return validationError(error);
  }

  if (isApiError(error)) {
    return fail(error.message, error.status, error.errors);
  }

  console.error(label, error);
  return fail("An unexpected error occurred. Please try again.", 500);
}
