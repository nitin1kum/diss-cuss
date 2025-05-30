"use client";
import { TmdbSearchResult } from "@/types/types";
import { ChevronDown, Loader, X } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

const SearchBar = ({close}  : {close : () => void}) => {
  const [isPending, setIsPending] = useState(false);
  const [showList, setShowList] = useState<boolean>(false);
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
    document.addEventListener("click", handleClick);
    function handleClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowList(false);
        close();
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
      fetch("/api/collection/search?q=" + value + "&t=" + type).then(
        async (res) => {
          let data = await res.json();
          let items = data.data as TmdbSearchResult[];
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

  useEffect(() => {
    setIsPending(false);
  }, [list]);

  return (
    <div className="sm:w-[300px] w-full absolute sm:bg-transparent bg-bg z-50 inset-0 top-0 sm:relative flex items-center">
      <div className="flex w-full ring-border-secondary rounded-full ring-[1px] overflow-hidden">
        <button
          onClick={handleTypeChange}
          className="flex gap-1 p-2 bg-card w-32 justify-between text-text items-center"
        >
          {type === "movie" ? "Movies" : "TV"}{" "}
          <ChevronDown className="size-5" />
        </button>
        <input
          ref={containerRef}
          type="search"
          id="search"
          className="w-full border-none p-2 outline-none text-text bg-transparent"
          placeholder="Search for movies, web series..."
          onChange={handleChange}
          onFocus={handleFocus}
        />
        <button onClick={close} className="text-subtext sm:hidden h-full w-16 flex p-2 items-center justify-center bg-card"><X/></button>
      </div>
      {showType && (
        <div className="absolute top-full mt-3 bg-card w-24 text-subtext border border-border shadow-ll">
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
            TV
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
                    <Link
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
                    </Link>
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
  );
};

export default SearchBar;
