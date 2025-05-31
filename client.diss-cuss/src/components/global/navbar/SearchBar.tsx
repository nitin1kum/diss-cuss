"use client";

import { SearchResponse, TmdbSearchResult } from "@/types/types";
import { ChevronDown, Loader, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import DefaultLink from "../default-link";
import { useLoader } from "@/contexts/LoaderStateProvider";

const SearchBar = () => {
  const [isPending, setIsPending] = useState(false);
  const [showList, setShowList] = useState<boolean>(false);
  const router = useRouter();
  const context = useLoader();
  const [showNav, setShowNav] = useState(false)
  const [showType, setShowType] = useState<boolean>(false);
  const [list, setList] = useState<TmdbSearchResult[] | null>(null);
  const [type, setType] = useState<"movie" | "tv">("movie");
  const containerRef = useRef<HTMLInputElement | null>(null);
  const [value, setValue] = useState("");
  let debounce: any = null;

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setIsPending(true);
    if (debounce) clearTimeout(debounce);
    debounce = setTimeout(() => {
      setValue(event.target.value);
    }, 500);
  }

  function handleFocus() {
    setShowList(true);
    setShowNav(true);
    document.addEventListener("click", handleClick);
    function handleClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowList(false);
        setShowNav(false)
        containerRef.current.value = "";
        setList([]);
        document.removeEventListener("click", handleClick);
      }
    }
  }

  useEffect(() => {
    if (value === "") {
      setIsPending(false);
      return;
    }
    try {
      fetch(`/api/collection/search?q=${value}&t=${type}&page=1`).then(
        async (res) => {
          let data = (await res.json()) as SearchResponse;
          let items = data.results;
          items.forEach((item) => (item.media_type = type));
          setList(items);
        }
      );
    } catch (error) {
      console.log("Error while fetching data - ", error);
    }
  }, [value]);

  function handleOutsideChange() {
    setShowType(false);
    document.removeEventListener("click", handleOutsideChange);
  }

  const handleTypeChange = () => {
    setShowType(true);
    setShowList(false);
    document.removeEventListener("click", handleOutsideChange);
    document.addEventListener("click", handleOutsideChange);
  };

  const handleSubmit = (e : React.FormEvent) => {
    e.preventDefault();
    if(value === "") return;
    if(context){
      context.setShowLoader(true);
      context.setProgress(20);
    }
    router.push(`/search/${type}/${value}`)
  }

  useEffect(() => {
    setIsPending(false);
  }, [list]);

  return (
    <>
      <button className="text-subtext" onClick={handleFocus}>
        <Search />
      </button>
      <div className={`${showNav ? "flex" : "hidden"} sm:w-[300px] w-full absolute sm:bg-transparent bg-bg z-50 inset-0 top-0 sm:relative sm:flex items-center`}>
        <div className="flex w-full ring-border-secondary rounded-full ring-[1px] overflow-hidden">
          <button
            onClick={handleTypeChange}
            className="flex gap-1 p-2 bg-card w-24 justify-between line-clamp-1 whitespace-nowrap text-text items-center"
          >
            <span className="w-full line-clamp-1">
              {type === "movie" ? "Movies" : "TV/Web series"}{" "}
            </span>
            <ChevronDown className="size-5" />
          </button>
          <form onSubmit={handleSubmit} className="relative w-full flex justify-between">
            <input
              ref={containerRef}
              type="search"
              id="search"
              className="w-full border-none p-2 outline-none text-text bg-transparent"
              placeholder="Search for movies, web series..."
              onChange={handleChange}
              onFocus={handleFocus}
            />
            <button
              type="submit"
              className="text-subtext  h-full w-12 flex items-center justify-center bg-card"
            >
              <Search className="size-5" />
            </button>
          </form>
        </div>
        {showType && (
          <div className="absolute top-full mt-3 bg-card w-36 text-subtext border border-border shadow-ll">
            <button
              onClick={() => setType("movie")}
              className={`border-b w-full border-border-secondary p-2 ${
                type === "movie" && "bg-gray-600/20"
              }`}
            >
              Movies
            </button>
            <button
              onClick={() => setType("tv")}
              className={`p-2 w-full ${type === "tv" && "bg-gray-600/20"}`}
            >
              TV/Web series
            </button>
          </div>
        )}
        {showList && (
          <div className="absolute top-full sm:mt-3 bg-card w-full sm:w-96 border border-border shadow-lg p-3 flex justify-center items-center">
            {isPending ? (
              <Loader className="text-subtext animate-spin" />
            ) : (
              <div className="w-full max-h-72 overflow-y-scroll">
                {list && list.length > 0 ? (
                  <>
                    {list.map((item, cnt) => (
                      <DefaultLink
                        href={`/discuss/${type}/${item.id}`}
                        key={item.id}
                        title={
                          item.media_type === "movie"
                            ? item.title || item.original_title
                            : item.name
                        }
                        className={`py-2 w-full block text-ellipsis ${
                          cnt !== 0 &&
                          "border-t text-text border-border-secondary"
                        }`}
                      >
                        <div>
                          {item.media_type === "movie"
                            ? item.title || item.original_title
                            : item.name || item.original_name}
                        </div>
                        <span className="text-subtext text-sm font-medium">
                          {item.media_type === "movie"
                            ? item.release_date
                            : item.first_air_date}
                        </span>
                      </DefaultLink>
                    ))}
                  </>
                ) : (
                  <div className="py-2 text-center text-subtext">
                    {value.length === 0
                      ? "Please type something"
                      : "No item to show"}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default SearchBar;
