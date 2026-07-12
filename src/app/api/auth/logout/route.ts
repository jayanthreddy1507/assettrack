import { type NextRequest } from "next/server";

import { ok } from "@/lib/api-response";

export async function POST(_request: NextRequest) {
  const response = ok({ redirectTo: "/auth/login" }, "Signed out successfully.");

  response.cookies.set("token", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
