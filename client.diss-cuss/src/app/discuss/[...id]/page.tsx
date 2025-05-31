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

const generateJsonLD = async (discussion_id: string) => {
  const popularThreads = await prisma.thread.findMany({
    where: {
      discussion_id,
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

  // Build JSON-LD for the main thread + popular threads box
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
  return jsonLd;
};

const Discuss = async ({ params }: { params: Promise<any> }) => {
  const { id } = await params;
  if (!id || id.length < 2) {
    redirect("/");
  }

  const res = await fetch(
    `${process.env.NEXTBASE_URL}/api/collection/details?t=${id[0]}&id=${id[1]}`,
    { cache: "force-cache", next: { revalidate: 60 * 60 * 24 * 30 } }
  );

  if (!res.ok) {
    toast.error("Oops! Some error occurred");
    return <DiscussSkeleton />;
  }

  const data = (await res.json()) as DetailsResponse;
  const { data: mediaInfo, discussion_id } = data;
  const jsonLd = await generateJsonLD(discussion_id);

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
        <Suspense fallback={<DiscussSkeleton />}>
          <MovieHero media={mediaInfo} />
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
