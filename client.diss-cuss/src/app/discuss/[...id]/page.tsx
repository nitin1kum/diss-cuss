import React, { Suspense } from "react";
import MovieHero from "../_components/MovieHeader";
import { redirect } from "next/navigation";
import Discussion from "../_components/Discusson";
import { DetailsResponse } from "@/types/types";
import Head from "next/head";
import { DiscussSkeleton } from "../_components/MovieHeaderSkelton";
import { fetcher } from "@/utils/fetcher";
import ThreadsSkelton from "../_components/ThreadsSkelton";

export async function generateMetadata({ params }: { params: Promise<any> }) {
  try {
    // Fetch the discussion with its top thread (most likes)
    const {id : param} = (await params) as {id : string[]};
    const [type,id] = param;
    if (!id || !type) return null;

    const res = await fetcher(`/api/collection/metadata?type=${type}&id=${id}`);
    return res;
  } catch (error) {
    console.log(error)
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
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/collection/details?type=${id[0]}&id=${id[1]}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return <DiscussSkeleton />;
  }

  const data = (await res.json()) as DetailsResponse;
  const { data: mediaInfo, jsonLd } = data;

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
        <Suspense fallback={<ThreadsSkelton />}>
          <Discussion discussion_id={mediaInfo.id} name={mediaInfo.name} />
        </Suspense>
      </div>
    </>
  );
};

export default Discuss;
