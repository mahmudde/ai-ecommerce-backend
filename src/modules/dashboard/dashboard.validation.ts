import { z } from "zod";

export const adminUsersTableQuerySchema = z.object({
  search: z.string().optional(),
  role: z.enum(["USER", "MANAGER", "ADMIN"]).optional(),
  status: z.enum(["ACTIVE", "BLOCKED"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});