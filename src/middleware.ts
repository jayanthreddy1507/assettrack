import { NextRequest, NextResponse } from "next/server";

import { verifyTokenAtEdge } from "@/lib/edge-jwt";

const PUBLIC_PATHS = [
  "/",
  "/auth/login",
  "/auth/signup",
  "/auth/forgot-password",
  "/api/auth",
  "/api/health",
];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

function readToken(request: NextRequest) {
  const cookieToken = request.cookies.get("token")?.value ?? null;
  const bearerToken =
    request.headers
      .get("authorization")
      ?.replace(/^Bearer\s+/i, "")
      .trim() ?? null;

  return cookieToken ?? bearerToken;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    isPublicPath(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = readToken(request);
  const payload = token ? await verifyTokenAtEdge(token) : null;

  if (!payload?.isActive) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required.",
          data: null,
          errors: null,
        },
        { status: 401 },
      );
    }

    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
