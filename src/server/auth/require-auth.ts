import "server-only";

import type { NextRequest } from "next/server";

import { auth } from "@/auth";
import { ApiError } from "@/lib/api-error";
import { extractBearerToken, verifyToken } from "@/lib/jwt";
import { hasRole, type Role } from "@/server/auth/permissions";

export interface CurrentUser {
  id: string;
  email: string;
  role: Role;
  name?: string | null;
}

function tokenFromRequest(request: NextRequest) {
  return (
    extractBearerToken(request.headers.get("authorization")) ??
    request.cookies.get("token")?.value ??
    null
  );
}

export async function getCurrentUser(request: NextRequest): Promise<CurrentUser | null> {
  const session = await auth().catch(() => null);

  if (session?.user?.id && session.user.email) {
    return {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role as Role,
      name: session.user.name,
    };
  }

  const token = tokenFromRequest(request);
  const payload = token ? verifyToken(token) : null;

  if (!payload?.sub || !payload.email || !payload.role || !payload.isActive) {
    return null;
  }

  return {
    id: payload.sub,
    email: payload.email,
    role: payload.role as Role,
  };
}

export async function requireApiAuth(request: NextRequest, allowedRoles?: Role[]) {
  const user = await getCurrentUser(request);

  if (!user) {
    throw new ApiError(401, "Authentication required.");
  }

  if (allowedRoles?.length && !hasRole(user.role, allowedRoles)) {
    throw new ApiError(403, "You do not have permission to perform this action.");
  }

  return user;
}
