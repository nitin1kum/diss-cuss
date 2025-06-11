import { z } from "zod";

export const metadataSchema = z.object({
  id: z.string(),
  type: z.enum(["movie", "tv"]),
});
