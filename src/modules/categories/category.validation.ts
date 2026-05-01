import { z } from "zod";

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters")
    .max(80, "Category name must not exceed 80 characters"),
  description: z
    .string()
    .max(500, "Description must not exceed 500 characters")
    .optional(),
  imageUrl: z.string().url("Image URL must be valid").optional(),
  isActive: z.boolean().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const categoryParamsSchema = z.object({
  id: z.string().min(1, "Category id is required"),
});

export const categoryQuerySchema = z.object({
  search: z.string().optional(),
  isActive: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => {
      if (value === undefined) return undefined;
      return value === "true";
    }),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});