import { z } from "zod";

export const aiChatSchema = z.object({
  message: z
    .string()
    .min(2, "Message must be at least 2 characters")
    .max(1000, "Message must not exceed 1000 characters"),
});

export const searchSuggestionQuerySchema = z.object({
  query: z
    .string()
    .min(1, "Search query is required")
    .max(100, "Search query must not exceed 100 characters"),
});

export const productSuggestionSchema = z.object({
  rawIdea: z
    .string()
    .min(5, "Product idea must be at least 5 characters")
    .max(1000, "Product idea must not exceed 1000 characters"),
  category: z.string().optional(),
  targetAudience: z.string().optional(),
  qualityLevel: z.enum(["budget", "mid-range", "premium"]).optional(),
});