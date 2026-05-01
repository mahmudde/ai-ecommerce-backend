import { z } from "zod";

const specificationSchema = z.object({
  name: z
    .string()
    .min(1, "Specification name is required")
    .max(80, "Specification name must not exceed 80 characters"),
  value: z
    .string()
    .min(1, "Specification value is required")
    .max(200, "Specification value must not exceed 200 characters"),
});

const imageSchema = z.object({
  url: z.string().url("Image URL must be valid"),
  publicId: z.string().min(1, "Image publicId is required"),
  altText: z.string().max(120).optional(),
});

export const createProductSchema = z.object({
  name: z
    .string()
    .min(3, "Product name must be at least 3 characters")
    .max(120, "Product name must not exceed 120 characters"),
  shortDescription: z
    .string()
    .min(20, "Short description must be at least 20 characters")
    .max(180, "Short description must not exceed 180 characters"),
  description: z
    .string()
    .min(50, "Description must be at least 50 characters"),
  brand: z
    .string()
    .min(2, "Brand must be at least 2 characters")
    .max(80, "Brand must not exceed 80 characters"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  discountPrice: z.coerce.number().positive().optional(),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  categoryId: z.string().min(1, "Category is required"),
  tags: z.array(z.string().min(1)).min(1, "At least one tag is required"),
  images: z.array(imageSchema).min(1, "At least one product image is required"),
  specifications: z.array(specificationSchema).optional(),
  status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]).optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const productParamsSchema = z.object({
  id: z.string().min(1, "Product id is required"),
});

export const productSlugParamsSchema = z.object({
  slug: z.string().min(1, "Product slug is required"),
});

export const productQuerySchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]).optional(),
  sort: z
    .enum([
      "newest",
      "oldest",
      "price-low",
      "price-high",
      "rating",
      "top-selling",
      "most-viewed",
    ])
    .default("newest"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12),
});