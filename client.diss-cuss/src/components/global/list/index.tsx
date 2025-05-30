import { TmdbSearchResult } from "@/types/types";
import { Star } from "lucide-react";
import Link from "next/link";
import React from "react";

type Props = {
  heading: string;
  data: TmdbSearchResult[];
};

const List = ({ heading, data }: Props) => {
  return (
    <div className="p-4 my-6">
      <h3 className="text-text font-semibold capitalize text-2xl">{heading}</h3>
      <div className="grid lg:grid-cols-5 gap-x-6 gap-y-12 sm:grid-cols-3 grid-cols-2 m-auto">
        {data.map((discuss) => {
          const name =
            discuss.media_type === "movie"
              ? discuss.title || discuss.original_title
              : discuss.name || discuss.original_name;
          return (
            <Link
              href={`/discuss/${discuss.media_type}/${discuss.id}`}
              key={discuss.id}
              className="rounded-md shadow-xl hover:shadow-2xl relative group"
              title={name}
            >
              <img
                src={
                  discuss.poster_path
                    ? `https://image.tmdb.org/t/p/w1280/${discuss.poster_path}`
                    : "/default_poster.png"
                }
                alt={`${name}'s poster`}
                width={200}
                height={300}
                loading="lazy"
                className="w-full transition-all duration-200 h-full m-0 p-0"
              />
              <div className="absolute flex flex-col transition-all duration-200 p-3 justify-end items-center inset-0 w-full h-full z-10 bg-gradient-to-b from-transparent to-black/70 group-hover:to-black">
                <h4
                  className="text-white leading-tight m-0 mb-2 text-lg sm:text-2xl w-full overflow-y-scroll line-clamp-1"
                  title={
                    name
                  }
                >
                  {name}
                </h4>
                <div className="flex w-full justify-between gap-3 text-gray-300 text-xs sm:text-base">
                  <span>
                    {discuss.media_type === "movie"
                      ? discuss.release_date
                      : discuss.first_air_date}
                  </span>
                  <span className="flex gap-2 items-center">
                    <Star className="size-4 sm:size-5 fill-yellow-500 text-transparent" />{" "}
                    {discuss.vote_average.toFixed(1) || 0} / 10
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default List;
