"use client";

import Skeleton from "@/components/global/skelton";
import React from "react";
import ThreadsSkelton from "./ThreadsSkelton";

const MovieHeaderSkelton = () => {
  return (
    <div className="container px-6 lg:max-w-7xl m-auto py-6">
        <Skeleton className="w-64 lg:w-96 h-6 my-2 rounded-xl" />
        <Skeleton className="w-52 lg:w-72 h-5 my-2 rounded-xl" />
        <Skeleton className="w-72 lg:w-[400px] h-5 my-2 rounded-xl" />
      {/* Movie Hero Skeleton */}
      <div className="flex flex-col gap-6 my-8">
        <div className="flex items-center justify-center">
          <Skeleton className="w-full lg:w-[400px] h-[500px] sm:h-[700px] lg:h-[600px] rounded-xl" />
        </div>
        <div className="flex gap-2 items-center">
          <Skeleton className="h-8 max-w-52 rounded-full w-1/2" />
          <Skeleton className="h-8 max-w-52 rounded-full w-1/2" />
          <Skeleton className="h-8 max-w-52 rounded-full w-1/2" />
          <Skeleton className="h-8 max-w-52 rounded-full w-1/2" />
        </div>
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-5 w-1/4" />
          <Skeleton className="h-20 w-full" />
          <div className="flex gap-3 mt-4">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
      </div>
    </div>
  );
};

export const DiscussSkeleton = () => {
  return (
    <div className="container px-6 lg:max-w-7xl m-auto py-6">
      <MovieHeaderSkelton/>
      <ThreadsSkelton/>
    </div>
  )
}

export default MovieHeaderSkelton;
