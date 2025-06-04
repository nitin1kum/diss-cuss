import React, { Suspense } from "react";
import MovieHero from "../_components/MovieHeader";
import { redirect } from "next/navigation";
import Discussion from "../_components/Discusson";
import { DetailsResponse } from "@/types/types";
import { toast } from "react-toastify";
import { prisma } from "@/lib/prisma";
import Head from "next/head";
import { generateKeywords } from "@/utils/utilities";
import { DiscussSkeleton } from "../_components/MovieHeaderSkelton";

export async function generateMetadata({ params }: { params: Promise<any> }) {
  try {
    // Fetch the discussion with its top thread (most likes)
    const discussionId = (await params).id[1];
    if (!discussionId) return null;

    const discussion = await prisma.discussion.findUnique({
      where: { imdb_id: discussionId },
      select: {
        id: true,
        name: true,
        poster: true,
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

    if (!discussion) throw new Error();
    const keywords = generateKeywords(discussion.name);
    const mainThread = discussion.threads[0] || null;
    const mainSnippet = mainThread
      ? mainThread.content.slice(0, 120)
      : `Discussion about ${discussion.name}`;

    return {
      title: `${discussion.name} Discussion – Diss-Cuss`,
      description: `${
        mainSnippet && mainThread
          ? mainSnippet + "by user" + mainThread.user.username
          : "Discussion about " + discussion.name
      }`,
      keywords,
      openGraph: {
        title: `${discussion.name} Discussion – Diss-Cuss`,
        description: mainSnippet,
        url: `${process.env.NEXTBASE_URL}/discussion/${discussionId}`,
        siteName: "Diss-Cuss",
        images: [
          {
            url:
              discussion.name ||
              `${process.env.NEXTBASE_URL}/default_poster.png`,
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
          discussion.poster || `${process.env.NEXTBASE_URL}/default_poster.png`,
        ],
      },
      // This will need manual injection in your <head> if Next.js metadata API doesn’t support jsonLd directly:
      metadataBase: new URL(`${process.env.NEXTBASE_URL}`),
      alternates: {},
    };
  } catch (error) {
    return {
      title: "Discussion – Diss-Cuss",
      description: "Join the conversation about movie",
    };
  }
}

const Discuss = async ({ params }: { params: Promise<any> }) => {
  const { id } = await params;
  if (!id || id.length < 2) {
    redirect("/");
  }

  const res = await fetch(
    `${process.env.NEXTBASE_URL}/api/collection/details?t=${id[0]}&id=${id[1]}`,
    { next: { revalidate: 60 * 60 * 24 * 30 } }
  );

  if (!res.ok) {
    return <DiscussSkeleton />;
  }

  const data = (await res.json()) as DetailsResponse;
  const { data: mediaInfo, discussion_id, jsonLd } = data;

  return (
    <>
      <div className="container px-2 sm:px-6 lg:max-w-7xl m-auto py-6">
        <Head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(jsonLd),
            }}
          />
        </Head>
        <MovieHero media={mediaInfo} />
        <Suspense fallback={<DiscussSkeleton />}>
          <Discussion
            discussion_id={discussion_id}
            name={
              mediaInfo.media_type === "movie"
                ? mediaInfo.title
                : mediaInfo.name
            }
          />
        </Suspense>
      </div>
    </>
  );
};

export default Discuss;
