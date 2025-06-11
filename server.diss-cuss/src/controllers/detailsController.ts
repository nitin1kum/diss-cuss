import { Request, Response } from "express";
import { axiosTmdbInstance } from "../utils/axiosInstance";
import { TmdbMediaDetails } from "../types/types";
import { prisma } from "../lib/prisma";
import { generateJsonLd } from "../utils/generateJsonLd";
import { handleError } from "../utils/handleError";
import { detailsSchema } from "../schemas/details.schema";

interface reqQuery {
  type: "movie" | "tv";
  id: string;
}

export const getDetails = async (
  req: Request<any, any, any, reqQuery>,
  res: Response
) : Promise<any> => {
  try {
    const parsed = detailsSchema.safeParse(req.query);

    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten() });
    }
    const { type, id } = parsed.data;

    const discussion = await prisma.discussion.findUnique({
      where: {
        imdb_id_type: {
          imdb_id: id,
          type,
        },
      },
    });

    if (!discussion) {
      const details = await axiosTmdbInstance(`/${type}/${id}`);
      const mediaInfo = details.data as TmdbMediaDetails;
      mediaInfo.media_type = type;
      const name =
        mediaInfo.media_type === "movie"
          ? mediaInfo.title || mediaInfo.original_title
          : mediaInfo.name || mediaInfo.original_name;

      const newDiscussion = await prisma.discussion.create({
        data: {
          name,
          type: type || "movie",
          poster_path: mediaInfo.poster_path || "/default_poster.jpg",
          imdb_id: `${mediaInfo.id}`,
          adult: mediaInfo.adult,
          backdrop_path: mediaInfo.backdrop_path,
          budget:
            (mediaInfo.media_type === "movie" && `${mediaInfo.budget}`) || null,
          genres: mediaInfo.genres,
          homepage: mediaInfo.homepage,
          origin_country: mediaInfo.origin_country,
          original_title:
            mediaInfo.media_type === "movie"
              ? mediaInfo.original_title
              : mediaInfo.original_name,
          original_language: mediaInfo.original_language,
          popularity: mediaInfo.popularity,
          overview: mediaInfo.overview,
          production_companies: mediaInfo.production_companies,
          release_date:
            mediaInfo.media_type === "movie"
              ? mediaInfo.release_date
              : mediaInfo.first_air_date,
          revenue:
            (mediaInfo.media_type === "movie" && `${mediaInfo.revenue}`) ||
            null,
          runtime:
            (mediaInfo.media_type === "movie" && `${mediaInfo.runtime}`) ||
            null,
          status: mediaInfo.status,
          vote_average: `${mediaInfo.vote_average}`,
          vote_count: `${mediaInfo.vote_count}`,
        },
      });

      if (newDiscussion) {
        return res.status(201).json({
          data: mediaInfo,
          message: "Discussion created Successfully",
          jsonLd: [],
        });
      }
    }

    if (discussion) {
      const jsonLd = await generateJsonLd(discussion.id);

      return res.json({
        data: discussion,
        message: "Data fetched Successfully",
        jsonLd,
      });
    }

    res.status(400).json({
      data: null,
      discussion_id: discussion,
      message: "Oops! Some error occurred",
    });
  } catch (error) {
    const message = handleError(error, "Error fetching details - ");
    res.status(500).json({
      data: null,
      discussion_id: null,
      message,
    });
  }
}
