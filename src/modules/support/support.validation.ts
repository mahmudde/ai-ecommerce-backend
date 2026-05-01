import { z } from "zod";

export const createSupportMessageSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),

  email: z
    .string()
    .email("Please provide a valid email address")
    .max(150, "Email must not exceed 150 characters"),

  subject: z
    .string()
    .min(5, "Subject must be at least 5 characters")
    .max(150, "Subject must not exceed 150 characters"),

  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must not exceed 2000 characters"),
});

export const supportMessageParamsSchema = z.object({
  id: z.string().min(1, "Support message id is required"),
});

export const supportMessageQuerySchema = z.object({
  search: z.string().optional(),
  isResolved: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => {
      if (value === undefined) return undefined;
      return value === "true";
    }),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const resolveSupportMessageSchema = z.object({
  isResolved: z.boolean(),
});