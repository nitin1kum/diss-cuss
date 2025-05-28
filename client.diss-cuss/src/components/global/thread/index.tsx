"use client";

import { calculateLikes, calculateTime } from "@/utils/utilities";
import {
  Ellipsis,
  MessageSquare,
  Minus,
  Plus,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import React, { RefObject, useState } from "react";
import RichTextEditor from "../text-editor";
import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";
import { ThreadProps, ThreadResponse } from "@/types/types";
import ThreadSkelton from "./ThreadSkelton";
import ReactQuill from "react-quill-new";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

type Props = {
  thread: ThreadProps;
  isLast: boolean;
  level: number;
  hideParent: (lvl: number, child: ThreadResponse) => boolean;
};

const Thread = ({ thread, isLast, level, hideParent }: Props) => {
  const LIMIT = window.innerWidth >= 1080 ? 10 : window.innerWidth >= 600 ? 6 : 3;
  // wip optimize data loading
  // wip if level is greater than 3 than show editor in new thread page
  const [showEditor, setShowEditor] = useState(false);
  const { data } = useSession();
  const [showReply, setShowReply] = useState(level < LIMIT  && !(level%3 === 0));
  const [liked, setLiked] = useState<1 | 0 | -1>(
    thread.likes.length > 0 ? (thread.likes[0].liked ? 1 : -1) : 0
  );
  const [childReply, setChildReply] = useState<ThreadResponse[] | null>(null);
  const [likeCount, setLikeCount] = useState(thread._count.likes);
  const [isPending, setIsPending] = useState(false);

  // fetch replies
  const {
    data: replyData,
    error: repliesError,
    mutate,
  } = useSWR("/api/collection/threads/thread/" + thread.id, fetcher);

  if (repliesError) {
    toast.error("Error whilie fetching replies");
    console.log("error while fetching thread - ", repliesError);
  }

  // skelton
  if (!replyData) {
    return <ThreadSkelton key={thread.id} />;
  }
  const { thread: replies } = replyData as ThreadResponse;

  // funtion to handle thread submit
  const handleSubmit = async (editor: RefObject<ReactQuill | null>) => {
    if (!editor || !editor.current) return;
    const html = editor.current.getEditor().getSemanticHTML();
    const content = editor.current.getEditor().getText()
    if (editor.current.getEditor().getText().length >= 3) {
      try {
        setIsPending(true);
        const res = await fetch(`/api/collection/post/reply`, {
          method: "POST",
          body: JSON.stringify({
            content,
            html,
            thread_id: thread.id,
            discussion_id: thread.discussion_id,
          }),
          headers: {
            "Content-Type": "applicaton/json",
          },
        });

        if (!res.ok) {
          toast.error("Error while posting thread");
          return;
        }
        const { data: resData } = (await res.json()) as {
          data: ThreadProps;
          message: string;
        };
        mutate((prev: ThreadResponse) => {
          thread.replies.unshift(resData);
          if (!prev) {
            return {
              thread: [resData],
            };
          }
          return {
            ...prev,
            thread: [resData, ...prev.thread],
          };
        }, false);
        toast.success("Thread posted successfully");
        editor.current.getEditor().setText("");
        setShowEditor(false);
      } catch (error) {
        toast.error("Oops! Some error occurred");
        console.log("error while posting thread - ", error);
      } finally {
        setIsPending(false);
      }
    }
  };

  const handleParentHide = (lvl: number, childrenReplies: ThreadResponse) => {
    if (level >= lvl - LIMIT + 1) {
      if (level === lvl - LIMIT + 1) {
        setChildReply([...(childReply || []), ...[childrenReplies]]);
        return false;
      }
      return hideParent(lvl, childrenReplies);
    }
    return true;
  };

  const handleParentShow = () => {
    if (childReply && childReply.length > 0) {
      // Create a copy of the array to avoid mutating the original state
      const updatedChildReplies = [...childReply];
      updatedChildReplies.pop();

      // Update the state with a new reference
      setChildReply(
        updatedChildReplies.length > 0 ? updatedChildReplies : null
      );
    }
  };

  const updateLike = async (value: number) => {
    if (!data || !data.user) {
      redirect("/auth/sign-in");
    }
    try {
      const res = await fetch("/api/collection/threads/thread/like", {
        method: "POST",
        body: JSON.stringify({
          liked: value,
          thread_id: thread.id,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        toast.error("Can't update like.");
      }
    } catch (error) {
      toast.error("Unknown error");
      console.log("Error while update like - ", error);
    }
  };

  const handleLike = () => {
    if (!data?.user) {
      redirect("/auth/sign-in");
      return;
    }

    let newLiked: 1 | 0;
    let delta = 0;

    if (liked === 1) {
      // Already liked, so undo like
      newLiked = 0;
      delta = -1;
    } else if (liked === 0) {
      // Neutral → Like
      newLiked = 1;
      delta = +1;
    } else {
      // Disliked → Like
      newLiked = 1;
      delta = +2;
    }

    setLiked(newLiked);
    setLikeCount((prev) => prev + delta);
    updateLike(newLiked); // send 1 or 0 to backend
  };

  const handleDislike = () => {
    if (!data?.user) {
      redirect("/auth/sign-in");
      return;
    }

    let newLiked: -1 | 0;
    let delta = 0;

    if (liked === -1) {
      // Already disliked → Neutral
      newLiked = 0;
      delta = +1;
    } else if (liked === 0) {
      // Neutral → Dislike
      newLiked = -1;
      delta = -1;
    } else {
      // Liked → Dislike
      newLiked = -1;
      delta = -2;
    }

    setLiked(newLiked);
    setLikeCount((prev) => prev + delta);
    updateLike(newLiked); // send -1 or 0 to backend
  };

  const handleShowReplies = () => {
    if(level < LIMIT - 1){
      setShowReply(!showReply)
    }
    else{
      setShowReply(hideParent(level, replyData));
    }
  };

  return (
    <div className="my-8 relative group" key={thread.id}>
      {/* side path */}
      {thread.replies.length > 0 && (
        <div className="absolute group-hover:bg-text bottom-0 bg-subtext h-[calc(100%_-_4px)] w-[2px] translate-x-4 -z-10" />
      )}
      {thread.isReply && isLast && (
        <div className="absolute bg-bg h-[calc(100%_+_20px)] w-4 -z-10 -left-4 sm:-left-7 -bottom-3" />
      )}

      {/* header */}
      <header className="flex  text-text gap-2 items-start">
        {thread.isReply && (
          <div className="box-border absolute right-full h-6 -translate-y-3 border-0 border-solid border-b-[2px] cursor-pointer w-[10px] sm:w-[17px] border-l-[2px] rounded-bl-[12px] group-hover:border-text border-subtext" />
        )}
        <div className="size-8 sm:size-9 rounded-full bg-sky-600 flex items-center justify-start overflow-hidden">
          <img
            src={thread.user.image}
            alt="user image"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col justify-center gap-1">
          <div className="flex gap-2 items-start m-0 p-0">
            <span className="font-semibold text-sm tracking-wide leading-4">
              {thread.user.username}
            </span>
            <span className="text-subtext text-xs">
              • {calculateTime(new Date(thread.createdAt))}
            </span>
          </div>
          {!thread.isReply && <span className="bg-sky-500/20 px-2 text-xs rounded-full m-0 w-fit leading-tight
          ">Main thread</span>}
        </div>
      </header>
      {/* content */}

      {/* action */}
      <div className=" pl-7 sm:pl-9 text-subtext" key={thread.id}>
        <div
          className="py-1 md:max-w-[600px] break-words" 
          dangerouslySetInnerHTML={{ __html: thread.html || thread.content }}
        />
        <div className="flex relative items-center gap-2 mt-1">
          {thread.replies.length > 0 && (
            <button
              onClick={handleShowReplies}
              className="rounded-full cursor-pointer translate-y-1 shadow-[0px_0px_0px_5px] shadow-bg z-10 border-[2px] absolute -left-5 sm:-left-7 bg-bg text-subtext group-hover:text-text group-hover:border-text border-subtext"
            >
              {showReply ? (
                <Minus className="size-4" />
              ) : (
                <Plus className="size-4" />
              )}
            </button>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={handleLike}
              className="hover:bg-sky-700/50 h-8 px-2 rounded-full"
            >
              <ThumbsUp
                className={`size-5 ${
                  liked === 1 && "fill-accent text-transparent"
                }`}
              />
            </button>
          </div>
          <span>{calculateLikes(likeCount)}</span>
          <button
            onClick={handleDislike}
            className="hover:bg-sky-700/50 h-8 px-2 rounded-full"
          >
            <ThumbsDown
              className={`size-5 ${
                liked === -1 && "fill-accent text-transparent"
              }`}
            />
          </button>
          <button
            onClick={() => setShowEditor(true)}
            className="flex gap-2 items-center hover:bg-sky-700/50 h-8 px-2 rounded-full"
          >
            <MessageSquare className="size-5" /> Reply
          </button>
          {/* wip add menu button */}
          {/* <button className="hover:bg-sky-700/50 h-8 px-2 rounded-full">
            <Ellipsis className="size-5 " />
          </button> */}
        </div>
        {/* {editor} */}
        {showEditor && (
          <RichTextEditor
            handleSubmit={handleSubmit}
            id={thread.id}
            isLoading={isPending}
            closeEditor={() => setShowEditor(false)}
            key={thread.id}
          />
        )}
        {/* Replies */}
        {showReply && (
          <>
            {childReply && childReply.length > 0 ? (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <button
                  onClick={handleParentShow}
                  className="text-subtext cursor-pointer pl-1 text-sm mt-4 relative"
                >
                  Show Parent
                  <div className="box-border absolute right-full h-6 -translate-y-3 border-0 border-solid border-b-[2px] cursor-pointer w-[11px] sm:w-[17px] border-l-[2px] rounded-bl-[12px] group-hover:border-text z-10 border-subtext top-0" />
                </button>
                {childReply[childReply.length - 1].thread.map((reply, id) => (
                  <Thread
                    thread={reply}
                    isLast={id === thread.replies.length - 1}
                    level={level + 1}
                    key={reply.id}
                    hideParent={handleParentHide}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                {replies.map((reply, id) => (
                  <Thread
                    thread={reply}
                    isLast={id === thread.replies.length - 1}
                    level={level + 1}
                    key={reply.id}
                    hideParent={handleParentHide}
                  />
                ))}
              </motion.div>
            )}
          </>
        )}

        {!showReply && replies.length > 0 && (
          <button
            onClick={handleShowReplies}
            className="text-subtext cursor-pointer pl-1 text-sm mt-4 relative"
          >
            Show {replies.length} repli{replies.length > 1 ? "es" : "y"}
            <div
              className="box-border absolute right-full h-6 -translate-y-3 border-0 border-solid border-b-[2px] cursor-pointer w-[11px] sm:w-[17px] border-l-[2px] rounded-bl-[12px] group-hover:border-text z-10 border-subtext
            top-0
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
