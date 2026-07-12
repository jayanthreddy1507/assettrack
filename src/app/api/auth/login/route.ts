import { type NextRequest } from "next/server";
import bcrypt from "bcryptjs";

import { fail, ok, validationError } from "@/lib/api-response";
import { signToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/schemas/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const { email, password, rememberMe } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        is_active: true,
        employees: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
      },
    });

    const passwordHash =
      user?.password ?? "$2a$10$invalidhashplaceholderXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
    const passwordMatches = await bcrypt.compare(password, passwordHash);

    if (!user || !passwordMatches) {
      return fail("Incorrect email or password.", 401);
    }

    if (!user.is_active) {
      return fail("Your account has been deactivated. Contact an administrator.", 403);
    }

    const token = signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      isActive: user.is_active,
    });

    const employeeName = user.employees
      ? `${user.employees.first_name ?? ""} ${user.employees.last_name ?? ""}`.trim()
      : "";
    const displayName = (user.name ?? employeeName) || user.email;

    const response = ok(
      {
        accessToken: token,
        redirectTo: "/dashboard",
        user: {
          id: user.id,
          name: displayName,
          email: user.email,
          role: user.role,
        },
      },
      "Signed in successfully.",
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      ...(rememberMe ? { maxAge: 60 * 60 * 24 * 7 } : {}),
    });

    return response;
  } catch (error) {
    console.error("[POST /api/auth/login]", error);
    return fail("An unexpected error occurred. Please try again.", 500);
  }
}
