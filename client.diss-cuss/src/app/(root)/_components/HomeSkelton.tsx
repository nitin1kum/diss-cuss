import Skeleton from "@/components/global/skelton";
import React from "react";

const HomeSkelton = () => {
  return (
    <div className="p-4">
      <Skeleton className="pt-4 w-72 mt-8 h-10 text-center text-text" />
      <div className="my-6">
        <Skeleton className="h-8 w-64 mb-2 font-semibold capitalize"/>
        <div className="grid lg:grid-cols-3 mt-8 gap-4 sm:grid-cols-2 grid-cols-1 m-auto">
          {Array.from({length : 7}).map((_,id) => (
            <Skeleton
              key={id+"home"}
              className="h-16 rounded-md  p-3"
            >
            </Skeleton>
          ))}
        </div>
      </div>
      <div className="my-6">
        <Skeleton className="h-8 w-64 mb-2 font-semibold capitalize"/>
        <div className="grid lg:grid-cols-3 mt-8 gap-4 sm:grid-cols-2 grid-cols-1 m-auto">
          {Array.from({length : 7}).map((_,id) => (
            <Skeleton
              key={id+"home"}
              className="h-16 rounded-md  p-3"
            >
            </Skeleton>
          ))}
        </div>
      </div>
      <div className="my-6">
        <Skeleton className="h-8 w-64 mb-2 font-semibold capitalize"/>
        <div className="grid lg:grid-cols-3 mt-8 gap-4 sm:grid-cols-2 grid-cols-1 m-auto">
          {Array.from({length : 7}).map((_,id) => (
            <Skeleton
              key={id+"home"}
              className="h-16 rounded-md  p-3"
            >
            </Skeleton>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeSkelton;
