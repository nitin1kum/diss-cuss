import { z } from "zod";

export const searchSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => parseInt(val || "1", 10))
    .refine((val) => Number.isInteger(val) && val > 0, {
      message: "Page must be a positive integer",
    }),
  query: z.string().min(1,{message : "Query should not be empty"}),
  type: z.enum(["movie","tv"]),
  limit: z
    .string()
    .optional()
    .transform((val) => Math.min(50, parseInt(val || "10", 10)))
    .refine((val) => Number.isInteger(val) && val > 0, {
      message: "Limit must be a positive integer",
    }),
});