import { z } from "zod";

export const createReviewSchema = z.object({
  rating: z.coerce
    .number()
    .int("Rating must be an integer")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot be more than 5"),

  comment: z
    .string()
    .min(10, "Review comment must be at least 10 characters")
    .max(1000, "Review comment must not exceed 1000 characters"),
});

export const updateReviewSchema = createReviewSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  {
    message: "At least one field is required to update review",
  }
);

export const reviewParamsSchema = z.object({
  id: z.string().min(1, "Review id is required"),
});

export const productReviewParamsSchema = z.object({
  productId: z.string().min(1, "Product id is required"),
});

export const reviewQuerySchema = z.object({
  rating: z.coerce.number().int().min(1).max(5).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});