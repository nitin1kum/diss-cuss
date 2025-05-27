import Image from "next/image";
import { Star } from "lucide-react";
import { TmdbMediaDetails } from "@/types/types";
import { calculateRunTime } from "@/utils/utilities";

const MovieHero = ({ media }: { media: TmdbMediaDetails }) => {
  return (
    <div className="py-2 relative z-10 text-text">
      {/* Meta Data */}
      <h1 className="font-medium m-0">
        {media.media_type === "movie" ? media.title : media.name}
      </h1>
      <p className="my-1 text-subtext">
        {media.media_type === "tv" ? media.original_name : media.original_title}
      </p>
      <div className="flex gap-2 text-subtext">
        <span>
          {media.media_type === "movie"
            ? media.release_date
            : media.first_air_date}
        </span>
        <span>•</span>
        <span>{media.adult || "not rated"}</span>
        <span>•</span>
        <span>
          {media.media_type === "movie" && calculateRunTime(media.runtime!)}
        </span>
      </div>
      {/* Poster */}
      <div>
        <Image
          src={"https://image.tmdb.org/t/p/w1280/" + media.poster_path!}
          alt="media poster"
          width={300}
          height={300}
          className="w-full object-contain md:aspect-video my-3"
        />
      </div>

      {/* Genre */}
      <div className="flex flex-nowrap w-full overflow-x-scroll gap-3 mb-3">
        {media.genres.map((genre) => (
          <div className="border whitespace-nowrap border-border-secondary p-1 px-6 rounded-full">
            {genre.name}
          </div>
        ))}
      </div>

      <p className="leading-7 text-[15px] tracking-wider">{media.overview}</p>
      <div className="flex items-center gap-2 mt-4">
        <Star className="text-yellow-400 fill-yellow-400 w-5 h-5" />
        <span className="text-lg font-medium text-text">
          {media.vote_average} / 10
        </span>
        <span className="text-sm text-subtext">({media.vote_count} votes)</span>
      </div>
    </div>
  );
};

export default MovieHero;
