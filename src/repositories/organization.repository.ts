import "server-only";

import { prisma } from "@/lib/prisma";
import type {
  CreateCategoryInput,
  CreateDepartmentInput,
  DirectoryQueryInput,
} from "@/schemas/organization";

function pagination(query: DirectoryQueryInput) {
  return {
    skip: (query.page - 1) * query.limit,
    take: query.limit,
  };
}

export async function listDepartments(query: DirectoryQueryInput) {
  const { skip, take } = pagination(query);
  const where = {
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: "insensitive" as const } },
            { code: { contains: query.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [items, total] = await prisma.$transaction([
    prisma.department.findMany({
      where,
      orderBy: { name: "asc" },
      skip,
      take,
    }),
    prisma.department.count({ where }),
  ]);

  return { items, pagination: { page: query.page, limit: query.limit, total } };
}

export function createDepartment(data: CreateDepartmentInput) {
  return prisma.department.create({ data });
}

export async function listCategories(query: DirectoryQueryInput) {
  const { skip, take } = pagination(query);
  const where = {
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: "insensitive" as const } },
            {
              description: {
                contains: query.search,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),
  };

  const [items, total] = await prisma.$transaction([
    prisma.category.findMany({
      where,
      orderBy: { name: "asc" },
      skip,
      take,
    }),
    prisma.category.count({ where }),
  ]);

  return { items, pagination: { page: query.page, limit: query.limit, total } };
}

export function createCategory(data: CreateCategoryInput) {
  return prisma.category.create({ data });
}

export async function listEmployees(query: DirectoryQueryInput) {
  const { skip, take } = pagination(query);
  const where = {
    ...(query.status ? { status: query.status as never } : {}),
    ...(query.search
      ? {
          OR: [
            {
              first_name: {
                contains: query.search,
                mode: "insensitive" as const,
              },
            },
            {
              last_name: {
                contains: query.search,
                mode: "insensitive" as const,
              },
            },
            { email: { contains: query.search, mode: "insensitive" as const } },
            {
              employee_code: {
                contains: query.search,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),
  };

  const [items, total] = await prisma.$transaction([
    prisma.employees.findMany({
      where,
      include: {
        departments_employees_department_idTodepartments: {
          select: { id: true, name: true, code: true },
        },
      },
      orderBy: [{ first_name: "asc" }, { last_name: "asc" }],
      skip,
      take,
    }),
    prisma.employees.count({ where }),
  ]);

  return { items, pagination: { page: query.page, limit: query.limit, total } };
}
