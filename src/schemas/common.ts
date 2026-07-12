import { z } from "zod";

export const uuidSchema = z.uuid("Invalid id.");

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().optional(),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
