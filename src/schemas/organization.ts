import { z } from "zod";

import { paginationSchema, uuidSchema } from "@/schemas/common";

export const createDepartmentSchema = z.object({
  name: z.string().trim().min(2, "Department name is required."),
  code: z.string().trim().min(2, "Department code is required.").toUpperCase(),
  description: z.string().trim().optional().nullable(),
  location: z.string().trim().optional().nullable(),
  parentId: uuidSchema.optional().nullable(),
  head_id: uuidSchema.optional().nullable(),
});

export const createCategorySchema = z.object({
  name: z.string().trim().min(2, "Category name is required."),
  description: z.string().trim().optional().nullable(),
  icon: z.string().trim().optional().nullable(),
  parentId: uuidSchema.optional().nullable(),
});

export const directoryQuerySchema = paginationSchema.extend({
  status: z.string().trim().optional(),
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type DirectoryQueryInput = z.infer<typeof directoryQuerySchema>;
