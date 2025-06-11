import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { metadataSchema } from "../schemas/metadata.schema";
import { generateKeywords } from "../utils/generateKeywords";

export async function getMetaData(req: Request, res: Response) : Promise<any> {
  try {
    const parsed = metadataSchema.safeParse(req.query);

    if (parsed.error) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const { id, type } = parsed.data;

    const discussion = await prisma.discussion.findUnique({
      where: {
        imdb_id_type: {
          imdb_id: id,
          type,
        },
      },

      select: {
        id: true,
        name: true,
        poster_path: true,
        threads: {
          where: { isReply: false },
          include: {
            user: { select: { username: true } },
            _count: { select: { likes: true } },
          },
          orderBy: { likes: { _count: "desc" } },
          take: 1,
        },
      },
    });

    if (!discussion) {
      return res.status(404).json({ error: "Discussion not found" });
    }

    const keywords = generateKeywords(discussion.name);
    const mainThread = discussion.threads[0] || null;
    const mainSnippet = mainThread
      ? mainThread.content.slice(0, 120)
      : `Discussion about ${discussion.name}`;

    const baseUrl = process.env.NEXTBASE_URL || "http://localhost:3000";

    res.json({
      title: `${discussion.name} Discussion – Diss-Cuss`,
      description:
        mainSnippet && mainThread
          ? mainSnippet + " by user " + mainThread.user.username
          : "Discussion about " + discussion.name,
      keywords,
      openGraph: {
        title: `${discussion.name} Discussion – Diss-Cuss`,
        description: mainSnippet,
        url: `${baseUrl}/discuss/${type}/${id}}`,
        siteName: "Diss-Cuss",
        images: [
          {
            url:
              `https://image.tmdb.org/t/p/w1280/${discussion.poster_path}` ||
              `${baseUrl}/default_poster.png`,
            width: 1200,
            height: 630,
            alt: discussion.name,
          },
        ],
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: `${discussion.name} Discussion – Diss-Cuss`,
        description: mainSnippet,
        images: [
          `https://image.tmdb.org/t/p/w1280/${discussion.poster_path}` ||
            `${baseUrl}/default_poster.png`,
        ],
      },
      metadataBase: baseUrl,
      alternates: {},
    });
  } catch (error) {
    res.status(500).json({
      title: "Discussion – Diss-Cuss",
      description: "Join the conversation about movie",
    });
  }
}
