import Skeleton from "@/components/global/skelton";
import React from "react";

const SearchSkelton = () => {
  return (
    <div className="p-4">
      <h2 className="pt-4 text-center text-4xl w-full text-text">Diss-Cuss</h2>
      <Skeleton className="h-10 w-72 sm:w-[400px] my-16 font-semibold capitalize" />
      <div className="grid lg:grid-cols-5 mt-8 gap-x-6 gap-y-12 sm:grid-cols-3 grid-cols-2 m-auto">
        {Array.from({ length: 14 }).map((_, id) => (
          <Skeleton
            key={id + "home"}
            className="h-96 rounded-md  p-3"
          ></Skeleton>
        ))}
      </div>
    </div>
  );
};

export default SearchSkelton;
