import { z } from "zod";

export const detailsSchema = z.object({
  id : z.string(),
  type : z.enum(["movie","tv"])
})
