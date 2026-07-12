import { z } from "zod";

import { paginationSchema, uuidSchema } from "@/schemas/common";

export const assetStatusSchema = z.enum([
  "AVAILABLE",
  "ALLOCATED",
  "IN_MAINTENANCE",
  "RESERVED",
  "RETIRED",
  "LOST",
  "STOLEN",
]);

export const assetConditionSchema = z.enum(["NEW", "GOOD", "FAIR", "POOR", "DAMAGED"]);

export const createAssetSchema = z.object({
  assetTag: z.string().trim().min(2, "Asset tag is required."),
  name: z.string().trim().min(2, "Asset name is required."),
  description: z.string().trim().optional().nullable(),
  serialNumber: z.string().trim().optional().nullable(),
  barcode: z.string().trim().optional().nullable(),
  qr_code: z.string().trim().optional().nullable(),
  status: assetStatusSchema.default("AVAILABLE"),
  condition: assetConditionSchema.default("GOOD"),
  is_bookable: z.coerce.boolean().default(false),
  purchaseDate: z.coerce.date().optional().nullable(),
  purchase_cost: z.coerce.number().nonnegative().optional().nullable(),
  manufacturer: z.string().trim().optional().nullable(),
  vendor: z.string().trim().optional().nullable(),
  warrantyExpiry: z.coerce.date().optional().nullable(),
  retirement_date: z.coerce.date().optional().nullable(),
  location: z.string().trim().optional().nullable(),
  departmentId: uuidSchema.optional().nullable(),
  categoryId: uuidSchema,
});

export const updateAssetSchema = createAssetSchema
  .partial()
  .refine(
    (value) => Object.keys(value).length > 0,
    "Provide at least one field to update.",
  );

export const assetQuerySchema = paginationSchema.extend({
  status: assetStatusSchema.optional(),
  condition: assetConditionSchema.optional(),
  categoryId: uuidSchema.optional(),
  departmentId: uuidSchema.optional(),
  is_bookable: z.coerce.boolean().optional(),
});

export type CreateAssetInput = z.infer<typeof createAssetSchema>;
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;
export type AssetQueryInput = z.infer<typeof assetQuerySchema>;
