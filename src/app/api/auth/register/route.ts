import { type NextRequest } from "next/server";
import bcrypt from "bcryptjs";

import { created, fail, validationError } from "@/lib/api-response";
import { signToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/schemas/auth";

function splitName(name: string) {
  const [firstName = name, ...rest] = name.trim().split(/\s+/);
  return {
    firstName,
    lastName: rest.join(" ") || "-",
  };
}

async function buildEmployeeCode(employeeId?: string) {
  if (employeeId) return employeeId;

  const count = await prisma.employees.count();
  return `EMP-${String(count + 1).padStart(4, "0")}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const { name, email, password, phone, employeeId } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return fail("An account with this email already exists.", 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const employeeCode = await buildEmployeeCode(employeeId);
    const { firstName, lastName } = splitName(name);

    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: passwordHash,
          role: "EMPLOYEE",
          is_active: true,
        },
      });

      await tx.employees.create({
        data: {
          employee_code: employeeCode,
          first_name: firstName,
          last_name: lastName,
          email,
          phone: phone || null,
          status: "ACTIVE",
          user_id: user.id,
          joined_at: new Date(),
        },
      });

      return user;
    });

    const token = signToken({
      sub: newUser.id,
      email: newUser.email,
      role: newUser.role,
      isActive: newUser.is_active,
    });

    const response = created(
      {
        accessToken: token,
        redirectTo: "/dashboard",
        user: {
          id: newUser.id,
          name,
          email: newUser.email,
          role: newUser.role,
        },
      },
      "Account created successfully.",
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("[POST /api/auth/register]", error);
    return fail("An unexpected error occurred. Please try again.", 500);
  }
}
