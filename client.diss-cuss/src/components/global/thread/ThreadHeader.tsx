import { ThreadProps } from "@/types/types";
import { calculateTime } from "@/utils/utilities";
import Image from "next/image";
import React from "react";

const ThreadHeader = ({
  thread,
  level,
  showParent,
  handleParentShow,
}: {
  thread: ThreadProps;
  level: number;
  showParent: boolean;
  handleParentShow: () => void;
}) => {
  return (
    <header className="flex justify-between text-text gap-2 items-center">
      {level > 1 && (
        <div className="box-border absolute right-full h-8 -translate-y-3 border-0 border-solid border-b-[2px] cursor-pointer w-[10px] sm:w-[17px] border-l-[2px] rounded-bl-[12px] group-hover:border-text border-subtext" />
      )}
      <div className="flex justify-start gap-2 items-start">
        <div className="size-8 sm:size-9 rounded-full bg-sky-600 flex items-center justify-start overflow-hidden">
          <Image
            src={thread.user.image}
            alt="user image"
            width={20}
            height={20}
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
          {!thread.isReply && (
            <span
              className="bg-sky-500/20 px-2 text-xs rounded-full m-0 w-fit leading-tight
              "
            >
              Main thread
            </span>
          )}
        </div>
      </div>
      {showParent && (
        <button
          onClick={handleParentShow}
          className="text-subtext cursor-pointer text-sm relative hover:bg-sky-500/40 bg-sky-500/20 px-2 rounded-full m-0 w-fit leading-tight"
        >
          Show Parent
        </button>
      )}
    </header>
  );
};

export default ThreadHeader;
