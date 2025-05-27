import Skeleton from "@/components/global/skelton";
import React from "react";

const ThreadsSkelton = () => {
  return (
    <div>
      {/* Discussion Header */}
      <div className="mt-10 mb-10 flex justify-between items-center">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-36 rounded-full" />
      </div>

      {/* Thread Editor (optional) */}
      <Skeleton className="h-40 w-full rounded-lg mb-6" />

      {/* Thread List Skeletons */}
      <div className="space-y-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="flex items-center gap-3">
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
        ))}
      </div>
    </div>
  );
};

export default ThreadsSkelton;
