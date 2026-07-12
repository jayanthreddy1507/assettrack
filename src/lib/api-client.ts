"use client";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T | null;
  errors: unknown;
}

export async function apiRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = (await response.json()) as ApiEnvelope<T>;

  if (!response.ok || !payload.success || payload.data === null) {
    throw new Error(payload.message || "The request could not be completed.");
  }

  return payload.data;
}
