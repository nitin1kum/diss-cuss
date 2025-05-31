"use client";

import { SearchResponse } from "@/types/types";
import { fetcher } from "@/utils/fetcher";
import React from "react";
import { toast } from "react-toastify";
import useSWRInfinite from "swr/infinite";
import SearchSkelton from "./SearchSkelton";
import List from "@/components/global/list";
import { Loader } from "lucide-react";
import UpdateLoader from "@/components/global/update-loader";
import { useLoader } from "@/contexts/LoaderStateProvider";

type Props = {
  type: "movie" | "tv";
  name: string;
};

const PAGE_SIZE = 10; // or whatever your API returns per page

const SearchPage = ({ type, name }: Props) => {
  const context = useLoader();
  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && !previousPageData.results.length) return null; // end
    return `/api/collection/search?q=${encodeURIComponent(
      name
    )}&t=${type}&page=${pageIndex + 1}`;
  };

  const { data, error, size, setSize, isValidating, isLoading } =
    useSWRInfinite<SearchResponse>(
      (pageIndex: number, previousPageData: SearchResponse | null) => {
        return getKey(pageIndex, previousPageData);
      },
      fetcher
    );

  if (error) {
    if (context) {
      context.setProgress(100);
      context.setShowLoader(false);
    }
    toast.error("Oops! Some error occurred.");
    return <SearchSkelton />;
  }

  const items = data ? data.flatMap((page) => page.results) : [];
  items.forEach((item) => (item.media_type = type));

  const isReachingEnd =
    data && data[data.length - 1]?.results?.length < PAGE_SIZE;

  return isLoading ? (
    <SearchSkelton />
  ) : (
    <div className="p-4">
      <UpdateLoader isLoading={isLoading} />
      <h2 className="pt-4 text-center text-4xl w-full text-text">Diss-Cuss</h2>

      <h1 className="text-text">Results for "{decodeURIComponent(name)}"</h1>
      <List heading="" data={items} />

      {!isReachingEnd && (
        <div className="flex justify-center">
          <button
            className="px-2 py-2 rounded-md bg-accent text-text"
            onClick={() => setSize(size + 1)}
            disabled={isValidating || isLoading}
          >
            {isValidating ? (
              <Loader className="animate-spin size-5" />
            ) : (
              "Load more"
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
