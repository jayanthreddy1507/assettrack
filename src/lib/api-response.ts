import { NextResponse } from "next/server";
import type { ZodError } from "zod";

export interface ApiSuccess<TData> {
  success: true;
  message: string;
  data: TData;
  errors: null;
}

export interface ApiFailure {
  success: false;
  message: string;
  data: null;
  errors: Record<string, string[]> | null;
}

export type ApiResponse<TData> = ApiSuccess<TData> | ApiFailure;

export function ok<TData>(
  data: TData,
  message = "Request successful.",
  init?: ResponseInit,
) {
  return NextResponse.json<ApiSuccess<TData>>(
    { success: true, message, data, errors: null },
    { status: 200, ...init },
  );
}

export function created<TData>(
  data: TData,
  message = "Resource created.",
  init?: ResponseInit,
) {
  return NextResponse.json<ApiSuccess<TData>>(
    { success: true, message, data, errors: null },
    { status: 201, ...init },
  );
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export function fail(
  message: string,
  status = 400,
  errors: Record<string, string[]> | null = null,
  init?: ResponseInit,
) {
  return NextResponse.json<ApiFailure>(
    { success: false, message, data: null, errors },
    { status, ...init },
  );
}

export function validationError(error: ZodError) {
  const { fieldErrors, formErrors } = error.flatten((issue) => issue.message) as {
    fieldErrors: Record<string, string[]>;
    formErrors: string[];
  };
  const errors: Record<string, string[]> = {};

  for (const [field, messages] of Object.entries(fieldErrors)) {
    if (messages?.length) {
      errors[field] = messages;
    }
  }

  if (formErrors.length) {
    errors.form = formErrors;
  }

  return fail("Validation failed.", 422, errors);
}
