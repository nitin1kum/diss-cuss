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
} from "../types/types";
import {
  CreateReplySchema,
  CreateThreadSchema,
  discussionThreadSchema,
  threadSchema,
  UpdateLikeSchema,
} from "../schemas/thread.schema";
import { paginationSchema } from "../schemas/pagination.schema";
import { threadTreeQuery, topReplyQuery, topThreadQuery } from "../utils/threadTreeQuery";
import { logger } from "../utils/logger";

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

export const getDiscussionThreads = async (
  req: AuthenticatedRequest<reqParamsDisscussion,any,any>,
  res: Response
): Promise<any> => {
  try {
    logger.info("Discussion thread endpoint hit")
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
    const topThreads = await prisma.$queryRawUnsafe(
      topThreadQuery,
      discussion_id,
      user_id,
      limit,
      offset
    ) as Array<{ id: string }>;

    const topIds = topThreads.map((t : {id : string}) => t.id);
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
    const rawRows = await prisma.$queryRawUnsafe(
      threadTreeQuery(3),
      topIds,
      user_id,
    ) as ThreadResult;

    const nodeMap: Record<string, ThreadMap> = {};
    rawRows.forEach((row : ThreadResponse) => {
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
        isReply : row.isReply,
        discussion_id : row.discussion_id,
        liked : row.liked,
        replies: [] as ThreadMap[],
      };
    });

    const roots: Thread[] = [];
    rawRows.forEach((row : ThreadResponse) => {
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
    logger.info("Thread endpoint hit")
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
    limit = Math.min(limit,3);
    const offset = (page - 1) * limit;

    // 2. Get paginated top‐level threads
    const topThreads = await prisma.$queryRawUnsafe(
      topReplyQuery,
      thread_id,
      user_id,
      limit,
      offset
    ) as Array<{ id: string }>;

    const topIds = topThreads.map((t : {id : string}) => t.id);
    const total_threads =
      (await prisma.thread.count({
        where: { parent_id: thread_id },
      }));

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
    const rawRows = await prisma.$queryRawUnsafe(
      threadTreeQuery(2),
      topIds,
      user_id
    ) as ThreadResult;

    const nodeMap: Record<string, ThreadMap> = {};
    rawRows.forEach((row : ThreadResponse) => {
      nodeMap[row.id] = {
        id: row.id,
        content: row.content,
        html: row.html,
        isReply : row.isReply,
        discussion_id : row.discussion_id,
        liked : row.liked,
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
    rawRows.forEach((row : ThreadResponse) => {
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
    logger.info("Thread like endpoint hit")
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
    logger.info("Create thread endpoint hit")
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
    logger.info("Create reply endpoint hit")
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
