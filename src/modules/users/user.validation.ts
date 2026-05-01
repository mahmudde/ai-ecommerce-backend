import { z } from "zod";

export const updateMyProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters")
    .optional(),

  phone: z
    .string()
    .min(6, "Phone must be at least 6 characters")
    .max(30, "Phone must not exceed 30 characters")
    .optional(),

  image: z.string().url("Image URL must be valid").optional(),

  street: z
    .string()
    .min(3, "Street must be at least 3 characters")
    .max(200, "Street must not exceed 200 characters")
    .optional(),

  city: z
    .string()
    .min(2, "City must be at least 2 characters")
    .max(80, "City must not exceed 80 characters")
    .optional(),

  country: z
    .string()
    .min(2, "Country must be at least 2 characters")
    .max(80, "Country must not exceed 80 characters")
    .optional(),

  postalCode: z
    .string()
    .min(3, "Postal code must be at least 3 characters")
    .max(20, "Postal code must not exceed 20 characters")
    .optional(),
});

export const userParamsSchema = z.object({
  id: z.string().min(1, "User id is required"),
});

export const usersQuerySchema = z.object({
  search: z.string().optional(),
  role: z.enum(["USER", "MANAGER", "ADMIN"]).optional(),
  status: z.enum(["ACTIVE", "BLOCKED"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(["USER", "MANAGER", "ADMIN"]),
});

export const updateUserStatusSchema = z.object({
  status: z.enum(["ACTIVE", "BLOCKED"]),
});