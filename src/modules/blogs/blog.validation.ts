import { z } from "zod";

export const createBlogSchema = z.object({
  title: z
    .string()
    .min(5, "Blog title must be at least 5 characters")
    .max(150, "Blog title must not exceed 150 characters"),

  excerpt: z
    .string()
    .min(20, "Excerpt must be at least 20 characters")
    .max(300, "Excerpt must not exceed 300 characters"),

  content: z
    .string()
    .min(100, "Blog content must be at least 100 characters"),

  coverImage: z.string().url("Cover image must be a valid URL").optional(),

  isPublished: z.boolean().optional(),
});

export const updateBlogSchema = createBlogSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  {
    message: "At least one field is required to update blog",
  }
);

export const blogParamsSchema = z.object({
  id: z.string().min(1, "Blog id is required"),
});

export const blogSlugParamsSchema = z.object({
  slug: z.string().min(1, "Blog slug is required"),
});

export const blogQuerySchema = z.object({
  search: z.string().optional(),
  isPublished: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => {
      if (value === undefined) return undefined;
      return value === "true";
    }),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});