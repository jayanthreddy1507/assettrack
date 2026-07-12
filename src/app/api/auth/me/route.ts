import { type NextRequest } from "next/server";

import { fail, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { requireApiAuth } from "@/server/auth/require-auth";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await requireApiAuth(request);

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        is_active: true,
        image: true,
        avatar: true,
        employees: {
          select: {
            id: true,
            employee_code: true,
            first_name: true,
            last_name: true,
            job_title: true,
            department_id: true,
          },
        },
      },
    });

    if (!user?.is_active) {
      return fail("Account not found or deactivated.", 401);
    }

    const employeeName = user.employees
      ? `${user.employees.first_name ?? ""} ${user.employees.last_name ?? ""}`.trim()
      : "";

    return ok({
      user: {
        id: user.id,
        name: (user.name ?? employeeName) || user.email,
        email: user.email,
        role: user.role,
        image: user.image ?? user.avatar,
        employee: user.employees,
      },
    });
  } catch (error) {
    if (error instanceof Error && "status" in error) {
      return fail(error.message, Number(error.status));
    }

    console.error("[GET /api/auth/me]", error);
    return fail("An unexpected error occurred. Please try again.", 500);
  }
}
