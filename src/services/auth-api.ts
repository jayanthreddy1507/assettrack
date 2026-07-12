import type {
  ApiErrorResponse,
  AuthResponse,
  LoginPayload,
  RegisterPayload,
} from "@/types/auth.ts";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api"
).replace(/\/$/, "");

const LOGIN_ENDPOINT =
  process.env.NEXT_PUBLIC_LOGIN_ENDPOINT ?? "/auth/login";

const REGISTER_ENDPOINT =
  process.env.NEXT_PUBLIC_REGISTER_ENDPOINT ?? "/auth/register";

async function parseResponse(response: Response): Promise<AuthResponse> {
  const data = (await response.json().catch(() => ({}))) as
    | AuthResponse
    | ApiErrorResponse;

  if (!response.ok) {
    const errorData = data as ApiErrorResponse;
    const fieldError = errorData.errors
      ? Object.values(errorData.errors)
          .flatMap((value) => (Array.isArray(value) ? value : [value]))
          .filter(Boolean)[0]
      : undefined;

    throw new Error(
      fieldError ||
        errorData.message ||
        errorData.error ||
        `Request failed with status ${response.status}.`
    );
  }

  return data as AuthResponse;
}

async function post<TPayload>(
  endpoint: string,
  payload: TPayload
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}

export function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  return post(LOGIN_ENDPOINT, payload);
}

export function registerUser(
  payload: RegisterPayload
): Promise<AuthResponse> {
  return post(REGISTER_ENDPOINT, payload);
}

export function getRedirectPath(
  response: AuthResponse,
  fallback = "/dashboard"
): string {
  return (
    response.redirectTo ||
    response.data?.redirectTo ||
    fallback
  );
}
