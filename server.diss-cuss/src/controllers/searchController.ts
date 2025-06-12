import { Request, Response } from "express";
import { axiosTmdbInstance } from "../utils/axiosInstance";
import { handleError } from "../utils/handleError";
import { searchSchema } from "../schemas/search.schema";
import { logger } from "../utils/logger";

interface reqQuery {
  query: string;
  page?: string;
  limit?: string;
  type: "movie" | "tv";
}

export const getSearchResults = async (
  req: Request<any, any, any, reqQuery>,
  res: Response
): Promise<any> => {
  try {
    logger.info("Search endpoint hit")
    const parsed = searchSchema.safeParse(req.query);

    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten() });
    }

    const { page, limit,type,query } = parsed.data;

    const searchResults = await axiosTmdbInstance(
      `/search/${type}?query=${query}&language=en-US&page=${page}&limit=${limit}&sort_by=popularity.desc`
    );
  
    return res.json(searchResults.data);
  } catch (error: any) {
    const message = handleError(
      error,
      "Error while fetching search results - "
    );
    return res.status(500).json({ message });
  }
};
