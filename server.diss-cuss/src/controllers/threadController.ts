import "dotenv/config";
import { Response } from "express";
import { prisma } from "../lib/prisma";
import { handleError } from "../utils/handleError";
import {
  AuthenticatedRequest,
  Thread,
  ThreadMap,
  ThreadResponse,
  ThreadResult,
  TmdbMediaDetails,
  TmdbMovie,
} from "../types/types";
import {
  CreateReplySchema,
  CreateThreadSchema,
  discussionThreadSchema,
  threadSchema,
  UpdateLikeSchema,
} from "../schemas/thread.schema";
import { paginationSchema } from "../schemas/pagination.schema";
import {
  threadTreeQuery,
  topReplyQuery,
  topThreadQuery,
} from "../utils/threadTreeQuery";
import { logger } from "../utils/logger";
import { axiosTmdbInstance } from "../utils/axiosInstance";
import { faker } from "@faker-js/faker";
import { generateMovieComments } from "../utils/generateOpinion";

interface reqParamsDisscussion {
  discussion_id: string;
}

interface reqParamsThread {
  thread_id: string;
}

interface reqQuery {
  page: string;
  limit: string;
}

interface reqBodyLike {
  liked: 1 | 0 | -1;
  thread_id: string;
}

interface reqBodyThread {
  content: string;
  html: string;
  discussion_id: string;
}

const MAX_USERS = 10;
const MAX_THREADS_PER_USER = 2;

export const getDiscussionThreads = async (
  req: AuthenticatedRequest<reqParamsDisscussion, any, any>,
  res: Response
): Promise<any> => {
  try {
    logger.info("Discussion thread endpoint hit");
    const user_id = req.user?.id || "";
    // 1. Validate request params + query
    const parsedParams = discussionThreadSchema.safeParse(req.params);
    const parsedQuery = paginationSchema.safeParse(req.query);

    if (!parsedParams.success) {
      return res.status(400).json({ errors: parsedParams.error.flatten() });
    }
    if (!parsedQuery.success) {
      return res.status(400).json({ errors: parsedQuery.error.flatten() });
    }

    const { discussion_id } = parsedParams.data;
    const { page, limit } = parsedQuery.data;
    const offset = (page - 1) * limit;

    // 2. Get paginated top‐level threads
    const topThreads = (await prisma.$queryRawUnsafe(
      topThreadQuery,
      discussion_id,
      user_id,
      limit,
      offset
    )) as Array<{ id: string }>;

    const topIds = topThreads.map((t: { id: string }) => t.id);
    const total_threads = await prisma.thread.count({
      where: { discussion_id, isReply: false },
    });
    const total_pages = Math.ceil(total_threads / limit);

    if (topIds.length === 0) {
      return res.status(200).json({
        message: "Threads fetched successfully",
        data: [],
        total_threads,
        total_pages,
        currentPage: page,
      });
    }

    // 3. Recursive CTE: fetch all descendants of those topIds
    const rawRows = (await prisma.$queryRawUnsafe(
      threadTreeQuery(3),
      topIds,
      user_id
    )) as ThreadResult;

    const nodeMap: Record<string, ThreadMap> = {};
    rawRows.forEach((row: ThreadResponse) => {
      nodeMap[row.id] = {
        id: row.id,
        content: row.content,
        html: row.html,
        createdAt: row.createdAt,
        user: {
          username: row.username,
          image: row.image,
        },
        like_count: Number(row.like_count),
        replies_count: Number(row.replies_count),
        depth: row.depth,
        isReply: row.isReply,
        discussion_id: row.discussion_id,
        liked: row.liked,
        replies: [] as ThreadMap[],
      };
    });

    const roots: Thread[] = [];
    rawRows.forEach((row: ThreadResponse) => {
      const node = nodeMap[row.id];
      if (row.parent_id && nodeMap[row.parent_id]) {
        nodeMap[row.parent_id].replies.push(node);
      } else if (row.depth === 1) {
        roots.push(node);
      }
    });

    return res.status(200).json({
      message: "Threads fetched successfully",
      data: roots,
      total_threads,
      total_pages,
      currentPage: page,
    });
  } catch (error) {
    const message = handleError(error, "Error fetching discussion threads - ");
    return res.status(500).json({ message });
  }
};

export const getThread = async (
  req: AuthenticatedRequest<reqParamsThread, reqQuery, any>,
  res: Response
): Promise<any> => {
  try {
    logger.info("Thread endpoint hit");
    const parsedParams = threadSchema.safeParse(req.params);
    const parsedQuery = paginationSchema.safeParse(req.query);
    const user_id = req.user?.id || "";
    if (!parsedParams.success) {
      return res.status(400).json({ errors: parsedParams.error.flatten() });
    }
    if (!parsedQuery.success) {
      return res.status(400).json({ errors: parsedQuery.error.flatten() });
    }

    const { thread_id } = parsedParams.data;

    let { page, limit } = parsedQuery.data;
    limit = Math.min(limit, 3);
    const offset = (page - 1) * limit;

    // 2. Get paginated top‐level threads
    const topThreads = (await prisma.$queryRawUnsafe(
      topReplyQuery,
      thread_id,
      user_id,
      limit,
      offset
    )) as Array<{ id: string }>;

    const topIds = topThreads.map((t: { id: string }) => t.id);
    const total_threads = await prisma.thread.count({
      where: { parent_id: thread_id },
    });

    const total_pages = Math.ceil(total_threads / limit);

    if (topIds.length === 0) {
      return res.status(200).json({
        message: "Threads fetched successfully",
        data: [],
        total_threads,
        total_pages,
        currentPage: page,
      });
    }

    // 3. Recursive CTE: fetch all descendants of those topIds
    const rawRows = (await prisma.$queryRawUnsafe(
      threadTreeQuery(2),
      topIds,
      user_id
    )) as ThreadResult;

    const nodeMap: Record<string, ThreadMap> = {};
    rawRows.forEach((row: ThreadResponse) => {
      nodeMap[row.id] = {
        id: row.id,
        content: row.content,
        html: row.html,
        isReply: row.isReply,
        discussion_id: row.discussion_id,
        liked: row.liked,
        createdAt: row.createdAt,
        user: {
          username: row.username,
          image: row.image,
        },
        like_count: Number(row.like_count),
        replies_count: Number(row.replies_count),
        depth: row.depth,
        replies: [] as ThreadMap[],
      };
    });

    const roots: Thread[] = [];
    rawRows.forEach((row: ThreadResponse) => {
      const node = nodeMap[row.id];
      if (row.parent_id && nodeMap[row.parent_id]) {
        nodeMap[row.parent_id].replies.push(node);
      } else if (row.depth === 1) {
        roots.push(node);
      }
    });

    return res.status(200).json({
      message: "Threads fetched successfully",
      data: roots,
      total_threads,
      total_pages,
      currentPage: page,
    });
  } catch (error) {
    const message = handleError(error, "Error fetching thread - ");
    return res.status(500).json({ message });
  }
};

export const likeThread = async (
  req: AuthenticatedRequest<any, any, reqBodyLike>,
  res: Response
): Promise<any> => {
  try {
    logger.info("Thread like endpoint hit");
    const user = req.user;
    if (!user) {
      return res.status(401).json("User not authorized");
    }

    const parsed = UpdateLikeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten() });
    }

    const { liked, thread_id } = parsed.data;

    if (!thread_id) {
      return res.status(404).json({ message: "Thread id not found" });
    }

    if (liked === 0) {
      const like = await prisma.like.delete({
        where: {
          user_id_thread_id: {
            user_id: user.id,
            thread_id,
          },
        },
      });

      if (like) {
        res.json({ message: "Like removed successfully." });
        return;
      }

      return res.status(400).json({ messsage: "Failes to remove like" });
    } else {
      const like = await prisma.like.upsert({
        where: {
          user_id_thread_id: {
            user_id: user.id,
            thread_id,
          },
        },
        create: {
          thread_id,
          liked: liked === 1,
          user_id: user.id,
        },
        update: {
          liked: liked === 1,
        },
      });

      if (like) {
        return res.json({ message: "Like updated successfully" });
      }
    }

    return res.status(400).json({ message: "Unknown error occurred" });
  } catch (error) {
    const message = handleError(error, "Error while updating like - ");
    return res.status(500).json({ message });
  }
};

export const createThread = async (
  req: AuthenticatedRequest<any, any, reqBodyThread>,
  res: Response
): Promise<any> => {
  try {
    logger.info("Create thread endpoint hit");
    const user = req.user;
    if (!user) {
      res.status(401).json("User not authorized");
      return;
    }
    console.log(req.body);
    const parsed = CreateThreadSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten() });
    }

    const { content, html, discussion_id } = parsed.data;

    const thread = await prisma.thread.create({
      data: {
        discussion_id,
        user_id: user.id,
        content,
        html,
      },
      include: {
        replies: {
          select: {
            id: true,
          },
        },
        user: {
          select: {
            username: true,
            image: true,
          },
        },
        _count: {
          select: {
            likes: {
              where: {
                liked: true,
              },
            },
          },
        },
        likes: {
          where: {
            user_id: user.id,
          },
          select: {
            liked: true,
          },
        },
      },
    });

    if (thread) {
      res.json({ message: "Thread Posted Successfully", data: thread });
    }

    res.status(400).json({ message: "Unknown error occurred" });
  } catch (error) {
    const message = handleError(error, "Error while updating like - ");
    res.status(500).json({ message });
  }
};

export const createReply = async (
  req: AuthenticatedRequest<any, any, reqBodyThread>,
  res: Response
): Promise<any> => {
  try {
    logger.info("Create reply endpoint hit");
    const user = req.user;
    if (!user) {
      res.status(401).json("User not authorized");
      return;
    }

    const parsed = CreateReplySchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten() });
    }

    const { content, html, discussion_id, parent_id } = parsed.data;

    const thread = await prisma.thread.create({
      data: {
        discussion_id,
        user_id: user.id,
        parent_id,
        isReply: true,
        content,
        html,
      },
      include: {
        replies: {
          select: {
            id: true,
          },
        },
        user: {
          select: {
            username: true,
            image: true,
          },
        },
        _count: {
          select: {
            likes: {
              where: {
                liked: true,
              },
            },
          },
        },
        likes: {
          where: {
            user_id: user.id,
          },
          select: {
            liked: true,
          },
        },
      },
    });

    if (thread) {
      res.json({ message: "Thread Posted Successfully", data: thread });
    }

    res.status(400).json({ message: "Unknown error occurred" });
  } catch (error) {
    const message = handleError(error, "Error while updating like - ");
    res.status(500).json({ message });
  }
};

export const threadFaker = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    logger.info("faker endpoint hit");

    // Fetch trending movies and TV shows
    const [movieRes, tvRes] = await Promise.all([
      axiosTmdbInstance(
        `https://api.themoviedb.org/3/trending/movie/day?sort_by=popularity.desc`
      ),
      axiosTmdbInstance(
        `https://api.themoviedb.org/3/trending/tv/day?sort_by=popularity.desc`
      ),
    ]);

    const allMedia = [...movieRes.data.results, ...tvRes.data.results];

    const allMediaDetails = await Promise.all(
      allMedia.map((media: TmdbMediaDetails) =>
        axiosTmdbInstance(`/${media.media_type}/${media.id}`).then(
          (res) => res.data
        )
      )
    );

    const users = await prisma.user.findMany({ where: { role: "TEST" } });
    if (users.length < 2) {
      throw new Error(
        "At least two test users are required to generate threads."
      );
    }
    let count = 0;

    for (const data of allMediaDetails) {
      data.media_type = data.title ? "movie" : "tv";
      const mediaInfo = data as TmdbMediaDetails;

      let discussion = await prisma.discussion.findUnique({
        where: { imdb_id_type: { imdb_id: String(mediaInfo.id), type : mediaInfo.media_type } },
        include: { _count: { select: { threads: true } } },
      });

      if (!discussion) {
        const name =
          mediaInfo.media_type === "movie"
            ? mediaInfo.title || mediaInfo.original_title
            : mediaInfo.name || mediaInfo.original_name;

        discussion = await prisma.discussion.create({
          data: {
            name,
            type: mediaInfo.media_type || "movie",
            poster_path: mediaInfo.poster_path || "/default_poster.jpg",
            imdb_id: `${mediaInfo.id}`,
            adult: mediaInfo.adult,
            backdrop_path: mediaInfo.backdrop_path,
            budget:
              (mediaInfo.media_type === "movie" && `${mediaInfo.budget}`) ||
              null,
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
          include : { _count: { select: { threads: true } } },
        });
      }

      if (discussion._count.threads > 0) continue;

      const opinions = await generateMovieComments(
        discussion.name,
        discussion.overview
      );
      const newThreads = [];

      let userIndex = 0;
      for (let i = 0; i < opinions.length - 1; i += 2) {
        const user1 = users[userIndex % users.length];
        userIndex++;
        const user2 = users[userIndex % users.length];
        userIndex++;

        newThreads.push(
          prisma.thread.create({
            data: {
              user_id: user1.id,
              discussion_id: discussion.id,
              content: opinions[i],
              html: `<p>${opinions[i]}</p>`,
              isReply: false,
              replies: {
                create: {
                  user_id: user2.id,
                  discussion_id: discussion.id,
                  content: opinions[i + 1],
                  html: `<p>${opinions[i + 1]}</p>`,
                  isReply: true,
                },
              },
            },
          })
        );
      }

      await Promise.all(newThreads);
      count++;
    }

    res
      .status(200)
      .json({ message: "Movie and TV show threads faked successfully",count });
  } catch (error) {
    const message = handleError(error, "Error while faking threads - ");
    res.status(500).json({ message });
  }
};
