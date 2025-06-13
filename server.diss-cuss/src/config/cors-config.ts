import { CorsOptions } from "cors";

const whitelist = (process.env.ALLOWED_ORIGINS)?.split(",") || ["http://localhost:3000",process.env.NEXT_BASE_URL!];

export const corsOptions : CorsOptions = {
  origin : whitelist,
  methods : ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders : ['Content-Type','Authorization'],
  credentials : true,
}