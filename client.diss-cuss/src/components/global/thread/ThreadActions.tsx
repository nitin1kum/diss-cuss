"use client";

import { useUser } from "@/contexts/AuthProvider";
import { fetcher } from "@/utils/fetcher";
import { calculateLikes } from "@/utils/utilities";
import {
  Ellipsis,
  MessageSquare,
  Minus,
  Plus,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
import { toast } from "react-toastify";

type Props = {
  liked: 0 | 1 | -1;
  id: string;
  likes: number;
  replies: number;
  showReply: boolean;
  setShowReply: React.Dispatch<React.SetStateAction<boolean>>;
  setShowEditor: React.Dispatch<React.SetStateAction<boolean>>;
};

const ThreadActions = ({
  liked,
  id,
  likes,
  replies,
  showReply,
  setShowReply,
  setShowEditor,
}: Props) => {
  const { user } = useUser();
  const [isLiked, setIsLiked] = useState<0 | 1 | -1>(liked);
  const [likeCount, setLikeCount] = useState(likes);
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement | null>(null);

  const updateLike = async (value: number) => {
    if (!user) {
      router.push("/auth/sign-in");
    }
    try {
      await fetcher("/api/collection/threads/update/like", {
        method: "POST",
        body: JSON.stringify({
          liked: value,
          thread_id: id,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      toast.error("Unknown error occurred");
      console.log("Error while update like - ", error);
    }
  };

  const handleLike = () => {
    if (!user) {
      return redirect("/auth/sign-in");
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

    setIsLiked(newLiked);
    setLikeCount((prev) => prev + delta);
    updateLike(newLiked); // send 1 or 0 to backend
  };

  const handleDislike = () => {
    if (!user) {
      return redirect("/auth/sign-in");
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

    setIsLiked(newLiked);
    setLikeCount((prev) => prev + delta);
    updateLike(newLiked); // send -1 or 0 to backend
  };

  function handleClick(event: MouseEvent) {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setShowMenu(false);
      document.removeEventListener("click", handleClick);
    }
  }

  const handleMenuShowClick = () => {
    if (showMenu) return;
    setShowMenu(true);
    document.addEventListener("click", handleClick);
  };

  return (
    <div className="flex relative items-center gap-2 mt-1">
      {replies > 0 && (
        <button
          onClick={() => setShowReply(!showReply)}
          className="rounded-full z-20  cursor-pointer translate-y-1 shadow-[0px_0px_0px_5px] shadow-bg border-[2px] absolute -left-5 sm:-left-7 bg-bg text-subtext group-hover:text-text group-hover:border-text border-subtext"
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
              isLiked === 1 && "fill-accent text-transparent"
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
            isLiked === -1 && "fill-accent text-transparent"
          }`}
        />
      </button>
      <button
        onClick={() => setShowEditor(true)}
        className="flex gap-2 items-center hover:bg-sky-700/50 h-8 px-2 rounded-full"
      >
        <MessageSquare className="size-5" /> Reply
      </button>
      <div className="relative">
        <button
          onClick={handleMenuShowClick}
          className="hover:bg-sky-700/50 relative h-8 px-2 rounded-full"
        >
          <Ellipsis className="size-5 " />
        </button>
        {showMenu && (
          <div
            ref={menuRef}
            className="absolute shadow-md flex flex-col w-48 rounded-md left-0 top-10 z-10 bg-card"
          >
            <button className="border-b cursor-not-allowed text-center border-border-secondary p-2 hover:bg-black/10 dark:hover:bg-white/10">
              Delete
            </button>
            <button className="border-b cursor-not-allowed text-center border-border-secondary p-2 hover:bg-black/10 dark:hover:bg-white/10">
              Report
            </button>
            <button className="text-center cursor-not-allowed p-2 hover:bg-black/10 dark:hover:bg-white/10">
              Edit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThreadActions;
