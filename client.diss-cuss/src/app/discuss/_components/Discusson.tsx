"use client";
import React, { RefObject, useEffect, useState } from "react";
import { Loader, Plus } from "lucide-react";
import useSWRInfinite from "swr/infinite";
import { toast } from "react-toastify";
import RichTextEditor from "@/components/global/text-editor";
import Thread from "@/components/global/thread";
import ThreadsSkelton from "./ThreadsSkelton";
import { fetcher } from "@/utils/fetcher";
import {
  CreatedThread,
  DiscussionThreadResponse,
  ThreadProps,
} from "@/types/types";
import { useLoader } from "@/contexts/LoaderStateProvider";
import UpdateLoader from "@/components/global/update-loader";
import { infiniteFetcher } from "@/utils/infiniteFetcher";

const PAGE_LIMIT = 10;

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
    if (previousPageData && pageIndex > previousPageData.total_pages - 1)
      return null;
    return `/api/collection/threads/discussion/${discussion_id}?page=${
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
    infiniteFetcher
  );

  if (error) {
    console.error("Error fetching threads:", error);

    toast.error("Oops! Some error occurred");
    if (context) {
      context.setProgress(100);
      context.setShowLoader(false);
    }
    return null;
  }

  // 3) aggregate arrays
  const threads = pages ? pages.flatMap((p) => p.data) : [];
  const totalDiscussion = pages?.[0]?.total_threads ?? 0;
  const totalPages = pages?.[0]?.total_pages || 1;
  const isLoadingInitial = !pages && !error;
  const isEmpty = pages?.[0]?.data.length === 0;
  const isReachingEnd = size >= totalPages;

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
      const data = await fetcher(`/api/collection/threads/create/thread`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, html, discussion_id }),
      });

      // Prepend to first page and revalidate
      const { data: newThread, message } = data as {
        message: string;
        data: CreatedThread;
      };

      const thread: ThreadProps = {
        user: newThread.user,
        replies: [],
        like_count: newThread._count.likes,
        replies_count: 0,
        liked: null,
        id: newThread.id,
        discussion_id: newThread.discussion_id,
        content: newThread.content,
        html: newThread.html,
        depth: 0,
        isReply: false,
        createdAt: newThread.createdAt,
      };

      await mutate((pages) => {
        if (!pages) {
          return [
            {
              total_threads: 1,
              message,
              data: [thread],
              total_pages: 1,
              currentPage: 1,
            },
          ];
        }

        const first = pages[0];

        return [
          {
            ...first,
            data: [thread, ...first.data],
            total_threads: first.total_threads + 1,
            total_pages: Math.ceil((first.total_threads + 1) / PAGE_LIMIT),
          },
          ...pages.slice(1),
        ];
      }, false);

      toast.success("Thread posted successfully");
      editor.current.getEditor().setText("");
      setShowEditor(false);
    } catch (err) {
      console.error("Error while posting thread - ", err);
      toast.error("Error while posting thread");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div key={discussion_id}>
      <h2 className="pt-16 text-text font-medium tracking-wide">
        Discussion{totalDiscussion > 0 && "s"} ({totalDiscussion})
      </h2>
      <UpdateLoader isLoading={isLoading} />
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
              level={1}
              isLast={idx === threads.length - 1}
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
