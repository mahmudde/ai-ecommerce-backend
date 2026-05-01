import { z } from "zod";

export const addCartItemSchema = z.object({
  productId: z.string().min(1, "Product id is required"),
  quantity: z.coerce
    .number()
    .int("Quantity must be an integer")
    .positive("Quantity must be at least 1")
    .max(20, "You can add maximum 20 items at a time"),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce
    .number()
    .int("Quantity must be an integer")
    .positive("Quantity must be at least 1")
    .max(20, "Quantity cannot exceed 20"),
});

export const cartItemParamsSchema = z.object({
  id: z.string().min(1, "Cart item id is required"),
});