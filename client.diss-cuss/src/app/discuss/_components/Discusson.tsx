"use client";
import React, { RefObject, useEffect, useState } from "react";
import { Loader, Plus } from "lucide-react";
import useSWRInfinite from "swr/infinite";
import { toast } from "react-toastify";

import RichTextEditor from "@/components/global/text-editor";
import Thread from "@/components/global/thread";
import ThreadsSkelton from "./ThreadsSkelton";
import { fetcher } from "@/utils/fetcher";
import { DiscussionThreadResponse, ThreadProps } from "@/types/types";
import { useLoader } from "@/contexts/LoaderStateProvider";
import UpdateLoader from "@/components/global/update-loader";

const PAGE_LIMIT = 6;

export default function Discussion({
  discussion_id,
  name,
}: {
  discussion_id: string;
  name: string;
}) {
  const [showEditor, setShowEditor] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const context = useLoader();

  // 1) SWR Infinite key function
  const getKey = (
    pageIndex: number,
    previousPageData: DiscussionThreadResponse | null
  ) => {
    // stop when no more data
    if (previousPageData && pageIndex > previousPageData.totalPages - 1)
      return null;
    return `/api/collection/threads/${discussion_id}?page=${
      pageIndex + 1
    }&limit=${PAGE_LIMIT}`;
  };

  // 2) useSWRInfinite
  const {
    data: pages,
    error,
    size,
    setSize,
    mutate,
    isValidating,
    isLoading,
  } = useSWRInfinite<DiscussionThreadResponse>(
    (pageIndex: number, previousPageData: DiscussionThreadResponse | null) => {
      if (!discussion_id) return null;
      return getKey(pageIndex, previousPageData);
    },
    fetcher
  );

  // 3) aggregate arrays
  const threads = pages ? pages.flatMap((p) => p.data) : [];
  const totalDiscussion = pages?.[0]?.threadCount ?? 0;
  const totalPages = pages?.[0]?.totalPages || 1;
  const isLoadingInitial = !pages && !error;
  const isEmpty = pages?.[0]?.data.length === 0;
  const isReachingEnd = size >= totalPages;

  if (error) {
    console.error("Error fetching threads:", error);
    toast.error("Oops! Some error occurred");
    return null;
  }

  if (isLoadingInitial) {
    return <ThreadsSkelton />;
  }

  // 5) posting a new thread
  const handleSubmit = async (editor: RefObject<any>) => {
    if (!editor?.current) return;
    const html = editor.current.getEditor().getSemanticHTML();
    const content = editor.current.getEditor().getText();
    const textLength = editor.current.getEditor().getText().trim().length;
    if (textLength < 3) {
      toast.warn("Please write at least 3 characters");
      return;
    }

    setIsPending(true);
    try {
      const res = await fetch(`/api/collection/post/thread`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, html, discussion_id }),
      });
      if (!res.ok) throw new Error("Failed to post");
      const { data: newThread } = await res.json();

      // Prepend to first page and revalidate
      await mutate((pages) => {
        if (!pages) return pages;
        const first = pages[0];
        return [
          {
            ...first,
            data: [newThread, ...first.data],
            threadCount: first.threadCount + 1,
          },
          ...pages.slice(1),
        ];
      }, false);

      toast.success("Thread posted successfully");
      editor.current.getEditor().setText("");
      setShowEditor(false);
    } catch (err) {
      console.error(err);
      toast.error("Error while posting thread");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div key={discussion_id}>
      <UpdateLoader isLoading={isLoading}/>
      <h2 className="pt-16 text-text font-medium tracking-wide">
        Discussion{totalDiscussion > 0 && "s"} ({totalDiscussion})
      </h2>

      <div className="flex gap-2 mb-10 items-center justify-between">
        <h3 className="text-text m-0 font-medium tracking-wide">{name}</h3>
        <button
          onClick={() => setShowEditor(true)}
          className="text-[15px] flex text-subtext hover:text-text p-1 px-6 rounded-full items-center gap-3 border-2 border-border-secondary"
        >
          <span className="hidden sm:block">Post thread</span>
          <Plus className="size-6" />
        </button>
      </div>

      {showEditor && (
        <RichTextEditor
          handleSubmit={handleSubmit}
          id={discussion_id}
          isLoading={isPending}
          content="Write anything (min length 3)..."
          closeEditor={() => setShowEditor(false)}
        />
      )}

      {isEmpty ? (
        <div className="w-full h-16 flex justify-center items-center text-xl font-semibold tracking-wide text-text">
          No discussion on {name}
        </div>
      ) : (
        <>
          {threads.map((thread: ThreadProps, idx: number) => (
            <Thread
              key={thread.id}
              thread={thread}
              isLast={idx === threads.length - 1}
              level={1}
              hideParent={() => {
                return true;
              }}
            />
          ))}
          {!isReachingEnd && (
            <div className="flex justify-center mt-4">
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
        </>
      )}
    </div>
  );
}
