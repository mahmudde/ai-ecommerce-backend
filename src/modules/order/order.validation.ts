import { z } from "zod";

export const createOrderSchema = z.object({
  shippingName: z
    .string()
    .min(2, "Shipping name must be at least 2 characters")
    .max(100, "Shipping name must not exceed 100 characters"),

  shippingPhone: z
    .string()
    .min(6, "Shipping phone must be at least 6 characters")
    .max(30, "Shipping phone must not exceed 30 characters"),

  shippingStreet: z
    .string()
    .min(5, "Shipping street must be at least 5 characters")
    .max(200, "Shipping street must not exceed 200 characters"),

  shippingCity: z
    .string()
    .min(2, "Shipping city must be at least 2 characters")
    .max(80, "Shipping city must not exceed 80 characters"),

  shippingCountry: z
    .string()
    .min(2, "Shipping country must be at least 2 characters")
    .max(80, "Shipping country must not exceed 80 characters"),

  shippingPostalCode: z
    .string()
    .min(3, "Postal code must be at least 3 characters")
    .max(20, "Postal code must not exceed 20 characters"),
});

export const orderParamsSchema = z.object({
  id: z.string().min(1, "Order id is required"),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ]),
});

export const orderQuerySchema = z.object({
  search: z.string().optional(),
  status: z
    .enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"])
    .optional(),
  paymentStatus: z
    .enum(["UNPAID", "PAID", "FAILED", "REFUNDED"])
    .optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});