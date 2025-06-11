import { Response, Request } from "express";
import { axiosTmdbInstance } from "../utils/axiosInstance";
import { handleError } from "../utils/handleError";
import { paginationSchema } from "../schemas/pagination.schema";

interface reqQuery {
  page: string;
  limit: string;
}

export const popularMovies = async (
  req: Request<any, any, any, reqQuery>,
  res: Response
): Promise<any> => {
  try {
    const parsed = paginationSchema.safeParse(req.query);

    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten() });
    }

    const { page, limit } = parsed.data;

    const moviesData = await axiosTmdbInstance(
      `/movie/popular?language=en-US&page=${page}&limit=${limit}&sort_by=popularity.desc`
    );

    const data = moviesData.data;
    data.results.forEach((movie : any) => {
      movie.media_type = "movie";
    });

    return res.json(data);
  } catch (error) {
    const message = handleError(error, "Error fetching popular movies - ");
    return res.status(500).json({ message });
  }
};

export const popularTvShows = async (
  req: Request<any, any, any, reqQuery>,
  res: Response
): Promise<any> => {
  try {
    const parsed = paginationSchema.safeParse(req.query);

    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten() });
    }

    const { page, limit } = parsed.data;
    const tvData = await axiosTmdbInstance(
      `/tv/popular?language=en-US&page=${page}&limit=${limit}&sort_by=popularity.desc`
    );

    const data = tvData.data;
    data.results.forEach((tv : any) => {
      tv.media_type = "tv";
    });

    return res.json(data);
  } catch (error) {
    const message = handleError(error, "Error fetching popular tv shows - ");
    return res.status(500).json({ message });
  }
};

export const upcomingMovies = async (
  req: Request<any, any, any, reqQuery>,
  res: Response
): Promise<any> => {
  try {
    const parsed = paginationSchema.safeParse(req.query);

    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten() });
    }

    const { page, limit } = parsed.data;
    const moviesData = await axiosTmdbInstance(
      `/discover/movie?&page=${page}&limit=${limit}&primary_release_date.gte=2025-06-01&release_date.gte=2025-06-01&sort_by=popularity.asc`
    );

    const data = moviesData.data;
    data.results.forEach((movie : any) => {
      movie.media_type = "movie";
    });

    return res.json(data);
  } catch (error) {
    const message = handleError(error, "Error fetching upcoming movies - ");
    return res.status(500).json({ message });
  }
};
