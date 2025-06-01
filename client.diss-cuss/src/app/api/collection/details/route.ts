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
          },
          { status: 201 }
        );
      }
    }

    if (discussion) {
      return NextResponse.json(
        {
          data: mediaInfo,
          discussion_id: discussion.id,
          message: "Data fetched Successfully",
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
