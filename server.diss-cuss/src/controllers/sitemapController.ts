import { prisma } from "../lib/prisma";
import { Request, Response } from "express";
import { handleError } from "../utils/handleError";
import { sitemapPaginationSchema } from "../schemas/pagination.schema";
import { logger } from "../utils/logger";

interface reqQuery {
  page: string;
  limit: string;
}

export const getUrls = async (
  req: Request<any, any, any, reqQuery>,
  res: Response
): Promise<any> => {
  try {
    logger.info("Urls sitemap endpoint hit")
    const parsed = sitemapPaginationSchema.safeParse(req.query);

    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten() });
    }

    const { page, limit } = parsed.data;
    const discussions = await prisma.discussion.findMany({
      select: {
        imdb_id: true,
        type: true,
        poster_path: true,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const urls: { url: string; poster: string }[] = [];
    discussions.forEach((url : any) => {
      urls.push({
        url: `${process.env.NEXT_BASE_URL}/discuss/${url.type}/${url.imdb_id}`,
        poster:
          url.poster_path.length > 0
            ? "https://image.tmdb.org/t/p/w1280/" + url.poster_path
            : `${process.env.NEXT_BASE_URL}/default_poster.png`,
      });
    });

    return res.json({ discussion_urls: urls });
  } catch (error) {
    const message = handleError(
      error,
      "Error while generating sitemap urls - "
    );
    return res.status(500).json({ discussion_urls: [], message });
  }
};

export const countUrls = async (req: Request, res: Response): Promise<any> => {
  try {
    logger.info("Count sitemaps endpoint hit")
    const discussions = await prisma.discussion.count();

    return res.json({ discussions_count: discussions });
  } catch (error) {
    const message = handleError(error, "Error while counting sitemap urls - ");
    return res.status(500).json({ message });
  }
};
