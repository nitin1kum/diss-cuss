"use client";

import { calculateLikes, calculateTime } from "@/utils/utilities";
import {
  Ellipsis,
  MessageSquare,
  Minus,
  Plus,
  ThumbsDown,
  ThumbsUp,
  User,
} from "lucide-react";
import React, { RefObject, useState } from "react";
import RichTextEditor from "../text-editor";
import useSWR from "swr";
import { fetcher } from "@/utils/fetcher";
import { ThreadProps, ThreadResponse } from "@/types/types";
import ThreadSkelton from "./ThreadSkelton";
import ReactQuill from "react-quill-new";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

type Props = {
  thread: ThreadProps;
  isLast: boolean;
  level: number;
};

const Thread = ({ thread, isLast, level }: Props) => {
  // wip optimize data loading
  // wip if level is greater than 3 than show editor in new thread page
  const [showEditor, setShowEditor] = useState(false);
  const { data } = useSession();
  const [showReply, setShowReply] = useState(level <= 3);
  const [liked, setLiked] = useState<1 | 0 | -1>(
    thread.likes.length > 0 ? (thread.likes[0].liked ? 1 : -1) : 0
  );
  const [likeCount, setLikeCount] = useState(thread._count.likes);
  const [isPending, setIsPending] = useState(false);
  let timer: any = null;

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
    const data = editor.current.getEditor().getSemanticHTML();
    if (editor.current.getEditor().getText().length >= 3) {
      try {
        setIsPending(true);
        const res = await fetch(`/api/collection/post/reply`, {
          method: "POST",
          body: JSON.stringify({
            content: data,
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

  return (
    <div className="my-8 relative group" key={thread.id}>
      {/* side path */}
      {thread.replies.length > 0 && (
        <div className="absolute group-hover:bg-text bg-subtext h-full w-[2px] translate-x-4 -z-10" />
      )}
      {thread.isReply && isLast && (
        <div className="absolute bg-bg h-full w-[3px] -z-10 -left-3 sm:-left-5" />
      )}

      {/* header */}
      <header className="flex  text-text gap-2 items-center">
        {thread.isReply && (
          <div className="box-border absolute right-full h-6 -translate-y-3 border-0 border-solid border-b-[2px] cursor-pointer w-[10px] sm:w-[17px] border-l-[2px] rounded-bl-[12px] group-hover:border-text border-subtext" />
        )}
        <div className="size-8 sm:size-9 rounded-full bg-sky-600 flex items-center justify-center">
          <User />
        </div>
        <span className="font-semibold tracking-wide">
          {thread.user.username}
        </span>
        <span className="text-subtext">
          • {calculateTime(new Date(thread.createdAt))}
        </span>
      </header>
      {/* content */}

      {/* action */}
      <div className=" pl-7 sm:pl-9 text-subtext" key={thread.id}>
        <div
          className="py-1"
          dangerouslySetInnerHTML={{ __html: thread.content }}
        />
        <div className="flex relative items-center gap-2 mt-1">
          {thread.replies.length > 0 && (
            <button
              onClick={() => setShowReply(!showReply)}
              className="rounded-full cursor-pointer translate-y-1 shadow-[0px_0px_0px_5px] shadow-bg z-10 border-[2px] absolute -left-5 sm:-left-7 bg-bg text-subtext group-hover:text-text group-hover:border-text border-subtext"
            >
              {showReply ? <Minus className="size-4" /> : <Plus className="size-4" />}
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
        {showReply &&
          replies.map((reply, id) => (
            <Thread
              thread={reply}
              isLast={id === thread.replies.length - 1}
              level={level + 1}
              key={reply.id}
            />
          ))}

        {!showReply && replies.length > 0 && (
          <button onClick={() => setShowReply(true)} className="text-subtext cursor-pointer pl-1 text-sm mt-4 relative">
            Show {replies.length} replies
            <div className="box-border absolute right-full h-6 -translate-y-3 border-0 border-solid border-b-[2px] cursor-pointer w-[10px] sm:w-[17px] border-l-[2px] rounded-bl-[12px] group-hover:border-text z-10 border-subtext
            top-0
            " />
            <div className="absolute border-l-4 -translate-y-1 h-8 -translate-x-3.5 sm:-translate-x-5 border-bg  inset-0"/>
          </button>
        )}
      </div>
    </div>
  );
};

export default Thread;
