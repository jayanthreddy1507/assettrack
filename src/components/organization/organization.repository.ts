import { dummyOrganizationData } from "./organization.data";
import type { OrganizationData } from "./organization.types";

/**
 * Single data-access entry point for Organization Setup.
 *
 * CURRENT:
 * Returns local dummy data so the UI can be tested without PostgreSQL.
 *
 * PRISMA:
 * Replace the function body with the implementation shown below after
 * your Prisma client singleton is available.
 */
export async function getOrganizationData(): Promise<OrganizationData> {
  return structuredClone(dummyOrganizationData);
}

/*
Example Prisma implementation for the supplied schema:

import { prisma } from "@/lib/prisma";

export async function getOrganizationData(): Promise<OrganizationData> {
  const [departments, categories, employees] = await Promise.all([
    prisma.department.findMany({
      include: {
        parent: {
          select: { id: true, name: true },
        },
        manager: {
          select: { id: true, name: true },
        },
        _count: {
          select: {
            users: true,
            assets: true,
          },
        },
      },
      orderBy: { name: "asc" },
    }),

    prisma.category.findMany({
      include: {
        parent: {
          select: { id: true, name: true },
        },
        _count: {
          select: { assets: true },
        },
      },
      orderBy: { name: "asc" },
    }),

    prisma.user.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        department: {
          select: { id: true, name: true },
        },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return {
    user: {
      name: "Admin User",
      role: "Administrator",
    },

    departments: departments.map((department) => ({
      id: department.id,
      name: department.name,
      code: department.code,
      description: department.description ?? undefined,
      parentDepartmentId: department.parent?.id,
      parentDepartmentName: department.parent?.name,
      managerId: department.manager?.id,
      managerName: department.manager?.name,
      status: department.deletedAt ? "Inactive" : "Active",
      employeeCount: department._count.users,
      assetCount: department._count.assets,
    })),

    categories: categories.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description ?? undefined,
      icon: category.icon ?? undefined,
      parentCategoryId: category.parent?.id,
      parentCategoryName: category.parent?.name,
      status: category.deletedAt ? "Inactive" : "Active",
      assetCount: category._count.assets,
    })),

    employees: employees.map((employee) => ({
      id: employee.id,
      name: employee.name,
      email: employee.email,
      employeeId: employee.employeeId ?? undefined,
      phone: employee.phone ?? undefined,
      departmentId: employee.department?.id,
      departmentName: employee.department?.name,
      role: employee.role,
      status: employee.status,
      avatar: employee.avatar ?? undefined,
    })),
  };
}
*/
