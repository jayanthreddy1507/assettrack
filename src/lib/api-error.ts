export class ApiError extends Error {
  readonly status: number;
  readonly errors: Record<string, string[]> | null;

  constructor(
    status: number,
    message: string,
    errors: Record<string, string[]> | null = null,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
