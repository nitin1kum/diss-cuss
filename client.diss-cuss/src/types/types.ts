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

export type TmdbMediaDetails = {
  id: string;
  name: string;
  type: string;
  poster_path: string;
  imdb_id: string;
  createdAt: Date;
  updatedAt: Date;
  adult: Boolean;
  backdrop_path?: string;
  budget?: string;
  homepage?: string;
  origin_country: string[];
  original_title: string;
  original_language: string;
  popularity?: number;
  overview: string;
  threads: any[];
  release_date: string;
  revenue?: string;
  runtime?: string;
  status?: string;
  vote_average: string;
  vote_count: string;

  genres: TmdbGenre[];
  production_companies: TmdbCompany[];
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

export type DetailsResponse = {
  data: TmdbMediaDetails;
  message: string;
  jsonLd: any;
};

export type DiscussionThreadResponse = {
  data: ThreadProps[];
  total_threads: number;
  total_pages: number;
  currentPage: number;
  message: string;
};

export type ThreadProps = {
  user: {
    username: string;
    image: string;
  };
  replies: ThreadProps[];
  like_count: number;
  replies_count: number;
  liked?: boolean | null;
  id: string;
  discussion_id: string;
  content: string;
  html: string;
  depth: number;
  isReply: boolean;
  createdAt: Date;
};

// Final response type
export type ThreadResponse = {
  data: ThreadProps[];
  total_threads: number;
  total_pages: number;
  currentPage: number;
  message: string;
};

export type Sitemap = Array<{
  url: string;
  lastModified?: string | Date;
  changeFrequency?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority?: number;
  alternates?: {
    languages?: Languages<string>;
  };
  images?: string[];
}>;

export type CreatedThread = {
  user: {
    username: string;
    image: string;
  };
  replies: {
    id: string;
  }[];
  likes: {
    liked: boolean;
  }[];
  _count: {
    likes: number;
  };
} & {
  content: string;
  html: string;
  discussion_id: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  user_id: string;
  isReply: boolean;
  parent_id: string | null;
};

export type User = {
  id: string;
  username: string;
  email: string;
  emailVerified?: string | Date | null;
  image?: string | null;
};
