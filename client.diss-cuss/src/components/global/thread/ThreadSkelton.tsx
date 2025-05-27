import React from "react";
import Skeleton from "../skelton";

const ThreadSkelton = () => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
      {/* Reply Thread Skeletons */}
      <div className="ml-12 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
};

export default ThreadSkelton;
