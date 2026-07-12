/**
 * Auth API service
 *
 * Calls the Next.js API routes under /api/auth/*.
 * The base URL defaults to an empty string so requests go to the same origin.
 * Set NEXT_PUBLIC_API_BASE_URL in .env only if you proxy to a different host.
 */

import type {
  ApiErrorResponse,
  AuthResponse,
  LoginPayload,
  RegisterPayload,
} from "@/types/auth";

// Default to same-origin (empty string) so /api/auth/login resolves correctly.
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");

async function parseResponse(response: Response): Promise<AuthResponse> {
  const data = (await response.json().catch(() => ({}))) as
    AuthResponse | ApiErrorResponse;

  if (!response.ok) {
    const errorData = data as ApiErrorResponse;
    const fieldError = errorData.errors
      ? Object.values(errorData.errors)
          .flatMap((v) => (Array.isArray(v) ? v : [v]))
          .filter(Boolean)[0]
      : undefined;

    throw new Error(
      fieldError ||
        errorData.message ||
        errorData.error ||
        `Request failed (${response.status}).`,
    );
  }

  return data as AuthResponse;
}

async function post<TPayload>(path: string, payload: TPayload): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

export function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  return post("/api/auth/login", payload);
}

export function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
  return post("/api/auth/register", payload);
}

export function getRedirectPath(response: AuthResponse, fallback = "/dashboard"): string {
  return response.redirectTo || response.data?.redirectTo || fallback;
}
