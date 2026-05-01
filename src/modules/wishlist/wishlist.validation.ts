import { z } from "zod";

export const wishlistParamsSchema = z.object({
  productId: z.string().min(1, "Product id is required"),
});

export const wishlistQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12),
});