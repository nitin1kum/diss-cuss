import { Languages } from "next/dist/lib/metadata/types/alternative-urls-types";

type TmdbMovieResult = {
  media_type: "movie";
  adult: boolean;
  backdrop_path: string | null;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
};

type TvSearchResult = {
  media_type: "tv";
  adult: boolean;
  backdrop_path: string | null;
  genre_ids: number[];
  id: number;
  origin_country: string[];
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  first_air_date: string;
  name: string;
  vote_average: number;
  vote_count: number;
};

export type TmdbSearchResult = TmdbMovieResult | TvSearchResult;

export type SearchResponse = {
  results: TmdbSearchResult[];
  total_pages: number;
  total_results: number;
  page: number;
};

type TmdbMovieDetails = {
  adult: boolean;
  backdrop_path: string | null;
  belongs_to_collection: {
    id: number;
    name: string;
    poster_path: string | null;
    backdrop_path: string | null;
  } | null;
  budget: number;
  genres: { id: number; name: string }[];
  homepage: string;
  id: number;
  imdb_id: string | null;
  origin_country: string[];
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  production_companies: {
    id: number;
    logo_path: string | null;
    name: string;
    origin_country: string;
  }[];
  production_countries: {
    iso_3166_1: string;
    name: string;
  }[];
  release_date: string;
  revenue: number;
  runtime: number;
  spoken_languages: {
    english_name: string;
    iso_639_1: string;
    name: string;
  }[];
  status: string;
  tagline: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
};

type TmdbGenre = {
  id: number;
  name: string;
};

type TmdbCompany = {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
};

type TmdbCountry = {
  iso_3166_1: string;
  name: string;
};

type TmdbLanguage = {
  english_name: string;
  iso_639_1: string;
  name: string;
};

// Common base
type TmdbBase = {
  adult: boolean;
  backdrop_path: string | null;
  genres: TmdbGenre[];
  homepage: string;
  id: number;
  origin_country: string[];
  original_language: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  production_companies: TmdbCompany[];
  production_countries: TmdbCountry[];
  spoken_languages: TmdbLanguage[];
  status: string;
  tagline: string;
  vote_average: number;
  vote_count: number;
};

// Movie-specific
type TmdbMovie = TmdbBase & {
  media_type: "movie";
  belongs_to_collection: {
    id: number;
    name: string;
    poster_path: string | null;
    backdrop_path: string | null;
  } | null;
  budget: number;
  imdb_id: string;
  original_title: string;
  release_date: string;
  revenue: number;
  runtime: number;
  title: string;
  video: boolean;
};

// TV-specific
type TmdbTv = TmdbBase & {
  media_type: "tv";
  created_by: any[];
  episode_run_time: number[];
  first_air_date: string;
  in_production: boolean;
  last_air_date: string;
  last_episode_to_air: {
    id: number;
    name: string;
    overview: string;
    vote_average: number;
    vote_count: number;
    air_date: string;
    episode_number: number;
    episode_type: string;
    production_code: string;
    runtime: number;
    season_number: number;
    show_id: number;
    still_path: string | null;
  } | null;
  name: string;
  next_episode_to_air: any | null;
  networks: TmdbCompany[];
  number_of_episodes: number;
  number_of_seasons: number;
  original_name: string;
  seasons: {
    air_date: string;
    episode_count: number;
    id: number;
    name: string;
    overview: string;
    poster_path: string | null;
    season_number: number;
    vote_average: number;
  }[];
  type: string;
};

// Union Type
export type TmdbMediaDetails = TmdbMovie | TmdbTv;

export type DetailsResponse = {
  data: TmdbMediaDetails;
  discussion_id: string;
  message: string;
  jsonLd : [] | null | undefined
};

export type DiscussionThreadResponse = {
  data: ({
    user: {
      username: string;
      image: string;
    };
    replies: {
      id: string;
    }[];
    _count: {
      likes: number;
    };
    likes: {
      liked: boolean;
    }[];
  } & {
    id: string;
    discussion_id: string;
    user_id: string;
    content: string;
    html: string;
    isReply: boolean;
    parent_id: string | null;
    createdAt: Date;
    updatedAt: Date;
  })[];
  threadCount: number;
  totalPages: number;
  currentPage: number;
  message: string;
};

export type ThreadProps = {
  user: {
    username: string;
    image: string;
  };
  replies: {
    id: string;
  }[];
  _count: {
    likes: number;
  };
  likes?: {
    liked: boolean;
  }[];
} & {
  id: string;
  discussion_id: string;
  user_id: string;
  content: string;
  html: string;
  isReply: boolean;
  parent_id: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// Final response type
export type ThreadResponse = {
  thread: ThreadProps[];
  message: string;
};

export type Sitemap = Array<{
  url: string
  lastModified?: string | Date
  changeFrequency?:
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never'
  priority?: number
  alternates?: {
    languages?: Languages<string>
  },
  images? : string[]
}>
