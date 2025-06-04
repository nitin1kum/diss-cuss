import { NextRequest, NextResponse } from "next/server";
import { options } from "../option";
import { prisma } from "@/lib/prisma";
import { TmdbMediaDetails } from "@/types/types";
import fs from "fs";
import { updateSitemap } from "@/action/updateSitemap";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("t");
    const id = searchParams.get("id");
    if (!type || !id) {
      throw new Error("Query not defined.");
    }

    const res = await fetch(
      `${process.env.TMDB_BASE_URL}/${type}/${id}`,
      options
    );

    if (!res.ok) {
      return NextResponse.json(
        { data: null, discussion_id: null, message: "Error fetching data" },
        { status: 201 }
      );
    }

    const data = await res.json();
    data.media_type = type;
    const mediaInfo = data as TmdbMediaDetails;

    const discussion = await prisma.discussion.findUnique({
      where: {
        imdb_id: `${data.id}` as string,
      },
      select: {
        id: true,
        imdb_id: true,
        name: true,
      },
    });

    if (!discussion) {
      const name =
        mediaInfo.media_type === "movie"
          ? mediaInfo.title || mediaInfo.original_title
          : mediaInfo.name || mediaInfo.original_name;

      const newDiscussion = await prisma.discussion.create({
        data: {
          imdb_id: `${mediaInfo.id}`,
          name,
          type: type || "movie",
          poster: mediaInfo.poster_path || "/default_poster.jpg",
        },
        select: {
          id: true,
        },
      });

      if (newDiscussion) {
        await updateSitemap(
          `${process.env.NEXTBASE_URL}/discuss/${type}/${id}`,
          mediaInfo.poster_path || undefined
        );
        return NextResponse.json(
          {
            data: mediaInfo,
            discussion_id: newDiscussion.id,
            message: "Discussion created Successfully",
            jsonLd: [],
          },
          { status: 201 }
        );
      }
    }

    if (discussion) {
      const popularThreads = await prisma.thread.findMany({
        where: {
          discussion_id : discussion.id,
          isReply: false,
        },
        orderBy: { likes: { _count: "desc" } },
        skip: 1,
        take: 3,
        select: {
          id: true,
          content: true,
          user: { select: { username: true } },
          _count: { select: { likes: true } },
          discussion: {
            select: { name: true, imdb_id: true },
          },
        },
      });

      if (popularThreads.length === 0) return [];

      const mainThread = popularThreads[0];
      const mainSnippet = mainThread.content;

      const jsonLd = [
        {
          "@context": "https://schema.org",
          "@type": "DiscussionForumPosting",
          headline: `${mainThread.user.username}'s top post`,
          articleBody: mainSnippet,
          author: { "@type": "Person", name: mainThread.user.username },
          url: `${process.env.NEXTBASE_URL}/discussion/${mainThread.discussion.imdb_id}`,
          interactionStatistic: {
            "@type": "InteractionCounter",
            interactionType: "https://schema.org/LikeAction",
            userInteractionCount: mainThread._count.likes,
          },
        },
        {
          "@context": "https://schema.org",
          "@type": "DiscussionForum",
          name: `${mainThread.discussion.name} – Popular Threads`,
          url: `${process.env.NEXTBASE_URL}/discussion/${mainThread.discussion.imdb_id}`,
          discussionForumPosting: popularThreads.map((t) => ({
            "@type": "DiscussionForumPosting",
            headline: `${t.user.username}'s thread snippet`,
            articleBody: t.content.slice(0, 80),
            author: { "@type": "Person", name: t.user.username },
            url: `${process.env.NEXTBASE_URL}/discussion/${mainThread.discussion.imdb_id}?thread=${t.id}`,
            interactionStatistic: {
              "@type": "InteractionCounter",
              interactionType: "https://schema.org/LikeAction",
              userInteractionCount: t._count.likes,
            },
          })),
        },
      ];

      return NextResponse.json(
        {
          data: mediaInfo,
          discussion_id: discussion.id,
          message: "Data fetched Successfully",
          jsonLd
        },
        { status: 200 }
      );
    }
    return NextResponse.json(
      { data: null, discussion_id: null, message: "Oops! Some error occurred" },
      { status: 400 }
    );
  } catch (error) {
    console.log("error while fetching details - ", error);
    return NextResponse.json(
      { data: null, discussion_id: null, message: "Internal server error" },
      { status: 500 }
    );
  }
}
