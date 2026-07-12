import { type NextRequest } from "next/server";
import { z } from "zod";

import { created, ok } from "@/lib/api-response";
import { handleRouteError } from "@/lib/handle-route-error";
import { prisma } from "@/lib/prisma";
import { parseJsonBody } from "@/lib/request";
import { getOrganizationData } from "@/repositories/workflows.repository";
import { requireApiAuth } from "@/server/auth/require-auth";

const actionSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("department"),
    id: z.string().optional(),
    name: z.string().trim().min(2),
    code: z.string().trim().min(2),
    description: z.string().trim().optional(),
    parentDepartmentId: z.uuid().optional(),
    managerId: z.uuid().optional(),
    status: z.enum(["Active", "Inactive"]),
  }),
  z.object({
    kind: z.literal("category"),
    id: z.string().optional(),
    name: z.string().trim().min(2),
    description: z.string().trim().optional(),
    icon: z.string().trim().optional(),
    parentCategoryId: z.uuid().optional(),
    status: z.enum(["Active", "Inactive"]),
  }),
  z.object({
    kind: z.literal("employee"),
    id: z.string().optional(),
    name: z.string().trim().min(2),
    email: z.email(),
    employeeId: z.string().trim().min(1),
    phone: z.string().trim().optional(),
    departmentId: z.uuid().optional(),
    role: z.enum([
      "SUPER_ADMIN",
      "ADMIN",
      "MANAGER",
      "TECHNICIAN",
      "EMPLOYEE",
      "AUDITOR",
    ]),
    status: z.enum(["ACTIVE", "INACTIVE", "ON_LEAVE", "TERMINATED", "SUSPENDED"]),
  }),
  z.object({ kind: z.literal("departmentStatus"), id: z.uuid(), active: z.boolean() }),
  z.object({ kind: z.literal("categoryStatus"), id: z.uuid(), active: z.boolean() }),
  z.object({ kind: z.literal("employeeStatus"), id: z.uuid(), active: z.boolean() }),
]);

export async function GET(request: NextRequest) {
  try {
    await requireApiAuth(request, ["SUPER_ADMIN", "ADMIN", "MANAGER"]);
    return ok(await getOrganizationData());
  } catch (error) {
    return handleRouteError(error, "[GET /api/organization]");
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireApiAuth(request, ["SUPER_ADMIN", "ADMIN"]);
    const input = await parseJsonBody(request, actionSchema);
    if (input.kind === "department") {
      const data = {
        name: input.name,
        code: input.code.toUpperCase(),
        description: input.description || null,
        parentId: input.parentDepartmentId || null,
        head_id: input.managerId || null,
        status: input.status === "Active" ? ("ACTIVE" as const) : ("INACTIVE" as const),
      };
      if (input.id && !input.id.startsWith("dept-"))
        await prisma.department.update({ where: { id: input.id }, data });
      else await prisma.department.create({ data });
    }
    if (input.kind === "category") {
      const data = {
        name: input.name,
        description: input.description || null,
        icon: input.icon || null,
        parentId: input.parentCategoryId || null,
        status: input.status === "Active" ? ("ACTIVE" as const) : ("INACTIVE" as const),
      };
      if (input.id && !input.id.startsWith("category-"))
        await prisma.category.update({ where: { id: input.id }, data });
      else await prisma.category.create({ data });
    }
    if (input.kind === "employee") {
      const [firstName, ...lastParts] = input.name.split(/\s+/);
      const employeeData = {
        employee_code: input.employeeId,
        first_name: firstName,
        last_name: lastParts.join(" ") || "-",
        email: input.email,
        phone: input.phone || null,
        department_id: input.departmentId || null,
        status: input.status,
      };
      if (input.id && !input.id.startsWith("employee-")) {
        const existing = await prisma.employees.update({
          where: { id: input.id },
          data: employeeData,
        });
        if (existing.user_id)
          await prisma.user.update({
            where: { id: existing.user_id },
            data: {
              name: input.name,
              email: input.email,
              role: input.role,
              is_active: input.status === "ACTIVE",
            },
          });
      } else {
        await prisma.user.create({
          data: {
            name: input.name,
            email: input.email,
            role: input.role,
            is_active: input.status === "ACTIVE",
            employees: { create: employeeData },
          },
        });
      }
    }
    if (input.kind === "departmentStatus")
      await prisma.department.update({
        where: { id: input.id },
        data: { status: input.active ? "ACTIVE" : "INACTIVE" },
      });
    if (input.kind === "categoryStatus")
      await prisma.category.update({
        where: { id: input.id },
        data: { status: input.active ? "ACTIVE" : "INACTIVE" },
      });
    if (input.kind === "employeeStatus")
      await prisma.employees.update({
        where: { id: input.id },
        data: { status: input.active ? "ACTIVE" : "INACTIVE" },
      });
    return created(await getOrganizationData(), "Organization updated.");
  } catch (error) {
    return handleRouteError(error, "[POST /api/organization]");
  }
}
