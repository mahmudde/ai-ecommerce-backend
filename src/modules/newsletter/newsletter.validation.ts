import { z } from "zod";

export const subscribeNewsletterSchema = z.object({
  email: z
    .string()
    .email("Please provide a valid email address")
    .max(150, "Email must not exceed 150 characters"),
});

export const newsletterSubscriberParamsSchema = z.object({
  id: z.string().min(1, "Subscriber id is required"),
});

export const newsletterSubscriberQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});