import { TmdbSearchResult } from "@/types/types";
import { Star } from "lucide-react";
import Link from "next/link";
import React from "react";

type Props = {
  heading: string;
  data: {
    data: TmdbSearchResult[];
  };
};

const List = ({ heading, data }: Props) => {

  return (
    <div className="p-4 my-6">
      <h3 className="text-text font-semibold capitalize">{heading}</h3>
      <div className="grid lg:grid-cols-3 gap-4 sm:grid-cols-2 grid-cols-1 m-auto">
        {data.data.map((discuss) => (
          <Link
            href={`/discuss/${discuss.media_type}/${discuss.id}`}
            key={discuss.id}
            className="border rounded-md border-border-secondary p-3"
          >
            <h4
              className="text-subtext w-full overflow-y-scroll"
              title={
                discuss.media_type === "movie"
                  ? discuss.title || discuss.original_title
                  : discuss.name || discuss.original_name
              }
            >
              {discuss.media_type === "movie"
                  ? discuss.title || discuss.original_title
                  : discuss.name || discuss.original_name}
            </h4>
            <div className="flex gap-3">
              <span className="w-32">{discuss.media_type === "movie" ? discuss.release_date : discuss.first_air_date}</span>
              <span className="flex gap-2 items-center">
               <Star className="size-5 fill-yellow-500 text-transparent"/> {discuss.vote_average || 0} / 10 rating</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default List;
