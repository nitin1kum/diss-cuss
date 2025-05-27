import React, { Suspense } from "react";
import MovieHero from "../_components/MovieHeader";
import { redirect } from "next/navigation";
import Discussion from "../_components/Discusson";
import { DetailsResponse } from "@/types/types";
import DiscussSkeleton from "../_components/MovieHeaderSkelton";
import { toast } from "react-toastify";
import ThreadsSkelton from "../_components/ThreadsSkelton";

const Discuss = async ({ params }: { params: { id: string[] } }) => {
  const { id } = await params;
  if (!id || id.length < 2) redirect("/");

  const res = await fetch(
    `${process.env.NEXTBASE_URL}/api/collection/details?t=${id[0]}&id=${id[1]}`
  );
  if (!res.ok) {
    toast.error("Oops! Some error occurred");
    return <DiscussSkeleton />;
  }

  const data = (await res.json()) as DetailsResponse;
  const { data: mediaInfo, discussion_id } = data;

  return (
    <div className="container px-6 lg:max-w-7xl m-auto py-6">
      <Suspense fallback={<DiscussSkeleton />}>
        <MovieHero media={mediaInfo} />
        <Discussion
          discussion_id={discussion_id}
          name={
            mediaInfo.media_type === "movie" ? mediaInfo.title : mediaInfo.name
          }
        />
      </Suspense>
    </div>
  );
};

export default Discuss;
