"use client";

import React, { RefObject, useRef, useState } from "react";
import RichTextEditor from "../text-editor";
import { fetcher } from "@/utils/fetcher";
import { CreatedThread, ThreadProps, ThreadResponse } from "@/types/types";
import ReactQuill from "react-quill-new";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import ThreadSkelton from "./ThreadSkelton";
import ThreadHeader from "./ThreadHeader";
import ThreadActions from "./ThreadActions";

type Props = {
  thread: ThreadProps;
  isLast: boolean;
  level: number;
  hideParent: (lvl: number, childrenReply: ThreadProps) => boolean;
};

const PAGE_LIMIT = 3;

const Thread = ({ level, thread, isLast, hideParent }: Props) => {
  const LIMIT = 3;
  // window.innerWidth >= 1080 ? 10 : window.innerWidth >= 600 ? 6 : 3;
  const [showEditor, setShowEditor] = useState(false);
  const [showReply, setShowReply] = useState(!(level % 3 == 0));
  const [childReply, setChildReply] = useState<ThreadProps[]>([thread]);
  const [loading, setLoading] = useState(false);
  const threadRef = useRef<HTMLDivElement | null>(null);
  const showButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousScrollPosition = useRef<number | null>(null);

  const currentThread = childReply[childReply.length - 1];

  const handleLoadMoreData = async () => {
    if (currentThread.replies.length < currentThread.replies_count) {
      try {
        setLoading(true);
        const page = Math.ceil(currentThread.replies.length / PAGE_LIMIT);
        const res = await fetcher(
          `/api/collection/threads/thread/${currentThread.id}?page=${
            page + 1
          }&limit=${PAGE_LIMIT}`
        );
        const { data, currentPage } = res as ThreadResponse;
        const updatedChilds = [...childReply];
        updatedChilds.pop();
        currentThread.replies = [...currentThread.replies, ...data];
        setChildReply([...updatedChilds, currentThread]);
      } catch (error) {
        console.log("Error while fetching threads - ", error);
        toast.error("Some unknown error occurred.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (editor: RefObject<ReactQuill | null>) => {
    if (!editor || !editor.current) return;
    const html = editor.current.getEditor().getSemanticHTML();
    const content = editor.current.getEditor().getText();
    if (editor.current.getEditor().getText().length >= 3) {
      try {
        setLoading(true);
        const res = await fetcher(`/api/collection/threads/create/reply`, {
          method: "POST",
          body: JSON.stringify({
            content,
            html,
            parent_id: thread.id,
            discussion_id: thread.discussion_id,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        const { data: resData, message } = res as {
          data: CreatedThread;
          message: string;
        };
        const newThread: ThreadProps = {
          id: resData.id,
          like_count: resData._count.likes,
          replies_count: 0,
          user: resData.user,
          replies: [],
          discussion_id: resData.discussion_id,
          content: resData.content,
          html: resData.html,
          createdAt: resData.createdAt,
          isReply: true,
          depth: thread.depth + 1,
        };

        currentThread.replies = [newThread, ...currentThread.replies];
        currentThread.replies_count = currentThread.replies_count + 1;
        const updatedChild = [...childReply];
        updatedChild.pop();
        setChildReply([...updatedChild, currentThread]);
        currentThread.replies_count += 1;

        toast.success("Thread posted successfully");
        editor.current.getEditor().setText("");
        setShowEditor(false);
      } catch (error) {
        toast.error("Oops! Some error occurred");
        console.log("error while posting thread - ", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleParentHide = (lvl: number, childrenReply: ThreadProps) => {
    if (level >= lvl - LIMIT + 1) {
      if (level === lvl - LIMIT + 1) {
        setChildReply([...childReply, childrenReply]);
        if (threadRef.current) {
          const offsetTop =
            threadRef.current.getBoundingClientRect().top + window.scrollY - window.innerHeight/2;
          window.scrollTo({ top: offsetTop }); // -20 for spacing
        }
        return false;
      }
      return hideParent(lvl, childrenReply);
    }
    return true;
  };

  const handleParentShow = () => {
    if (childReply && childReply.length > 0) {
      const updatedChildReplies = [...childReply];
      updatedChildReplies.pop();

      setChildReply(updatedChildReplies.length > 0 ? updatedChildReplies : []);
    }
  };

  const handleShowReplies = async () => {
    if (thread.replies.length === 0) {
      await handleLoadMoreData();
    }
    if (thread.depth < LIMIT - 1) {
      setShowReply(!showReply);
    } else {
      setShowReply(hideParent(level, thread));
    }
  };

  return (
    <div
      className="my-8 relative group"
      key={currentThread.id}
      id={`thread-${currentThread.id}`}
      ref={threadRef}
    >
      {/* side path */}
      {thread.replies_count > 0 && (
        <div className="absolute group-hover:bg-text bottom-0 bg-subtext h-[calc(100%_-_4px)] w-[2px] translate-x-4 -z-10" />
      )}
      {thread.isReply && isLast && level > 1 && (
        <div className="absolute bg-bg h-[calc(100%_+_20px)] w-4 -z-10 -left-4 sm:-left-7 -bottom-" />
      )}

      <ThreadHeader
        thread={currentThread}
        level={level}
        showParent={childReply.length > 1}
        handleParentShow={handleParentShow}
      />

      {/* content */}
      <div className=" pl-7 sm:pl-9 text-subtext" key={currentThread.id}>
        <div
          className="py-1 md:max-w-[600px] break-words"
          dangerouslySetInnerHTML={{ __html: thread.html || thread.content }}
        />
        {/* action */}
        <ThreadActions
          liked={
            (currentThread.liked && (currentThread.liked === true ? 1 : -1)) ||
            0
          }
          id={currentThread.id}
          likes={currentThread.like_count}
          replies={currentThread.replies.length}
          showReply={showReply}
          setShowReply={setShowReply}
          setShowEditor={setShowEditor}
        />

        {/* editor */}
        {showEditor && (
          <RichTextEditor
            handleSubmit={handleSubmit}
            id={thread.id}
            isLoading={loading}
            closeEditor={() => setShowEditor(false)}
            key={currentThread.id}
          />
        )}

        {/* Replies */}
        {loading && <ThreadSkelton key={"loading- skelton"} />}

        {showReply && (
          <>
            {childReply && childReply.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                {currentThread.replies.map((reply, id) => (
                  <Thread
                    thread={reply}
                    isLast={id === currentThread.replies_count - 1}
                    key={reply.id}
                    level={level + 1}
                    hideParent={handleParentHide}
                  />
                ))}
              </motion.div>
            )}
          </>
        )}

        {!showReply && currentThread.replies_count > 0 && (
          <button
            onClick={handleShowReplies}
            ref={showButtonRef}
            className="text-subtext cursor-pointer pl-1 text-sm mt-4 relative"
          >
            Show {currentThread.replies_count} repl
            {currentThread.replies_count > 1 ? "ies" : "y"}
            <div
              className="box-border absolute right-full h-10 -translate-y-3 border-0 border-solid border-b-[2px] cursor-pointer w-[11px] sm:w-[17px] border-l-[2px] rounded-bl-[12px] group-hover:border-text z-10 border-subtext
            -top-4
            "
            />
            <div className="absolute w-4 bg-bg bottom-0 -translate-y-1 h-8 -translate-x-6 border-bg  inset-0" />
          </button>
        )}

        {showReply &&
          currentThread.replies_count - currentThread.replies.length > 0 && (
            <button
              onClick={handleLoadMoreData}
              className="text-subtext cursor-pointer pl-1 text-sm mt-4 relative"
            >
              Show {currentThread.replies_count - currentThread.replies.length}{" "}
              repl
              {currentThread.replies_count - currentThread.replies.length > 1
                ? "ies"
                : "y"}
              <div
                className="box-border absolute right-full h-6 -translate-y-3 border-0 border-solid border-b-[2px] cursor-pointer w-[11px] sm:w-[17px] border-l-[2px] rounded-bl-[12px] group-hover:border-text z-10 border-subtext
            -top-4
            "
              />
              <div className="absolute w-4 bg-bg bottom-0 -translate-y-1 h-8 -translate-x-6 border-bg  inset-0" />
            </button>
          )}
      </div>
    </div>
  );
};

export default Thread;
