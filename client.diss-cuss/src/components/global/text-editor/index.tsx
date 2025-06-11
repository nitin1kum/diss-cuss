"use client";
import React, { RefObject, useEffect, useRef, useState } from "react";
import ReactQuill, { Quill } from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import ToolBar from "./ToolBar";
import { Loader2 } from "lucide-react";
import DefaultLink from "../default-link";
import { useUser } from "@/contexts/AuthProvider";

var formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "indent",
  "link",
  "image",
  "align",
  "size",
];

// Props for the editor
type Props = {
  content?: string;
  isLoading?: boolean;
  closeEditor: () => void;
  handleSubmit: (editor: RefObject<ReactQuill | null>) => Promise<void>;
  id: string;
};

const RichTextEditor: React.FC<Props> = ({
  content = "",
  closeEditor,
  isLoading,
  handleSubmit,
  id,
}) => {
  const { user } = useUser();
  const [savedRange, setSavedRange] = useState<ReactQuill.Range | null>(null);
  const quillRef = useRef<ReactQuill | null>(null);
  const modules = {
    toolbar: {
      container: `#${"editor" + id}`,
    },
  };

  const onSelectionChange = (range: any, oldRange: any, source: any) => {
    if (range) {
      setSavedRange(range);
    }
  };
  const handleCloseClick = () => {
    if (quillRef && quillRef.current) {
      quillRef.current.getEditor().setText("");
    }
    closeEditor();
  };

  return (
    <div className="text-editor border w-full min-w-72 sm:max-w-3xl border-border-secondary rounded-xl space-y-2 my-3">
      {!user ? (
        <div className="flex text-text items-center gap-3 justify-center py-10">
          Sign in to comment
          <DefaultLink
            href={"/auth/sign-in"}
            className="flex w-fit gap-2 items-center text-text p-2 rounded-md bg-accent brightness-90 hover:brightness-100"
          >
            Sign In
          </DefaultLink>
        </div>
      ) : (
        <>
          <ToolBar id={"editor" + id} />
          <div className="relative m-0 text-text">
            <ReactQuill
              ref={quillRef}
              className="border-none h-full"
              theme="snow"
              modules={modules}
              formats={formats}
              onChangeSelection={onSelectionChange}
              placeholder={content}
            />
          </div>
          <div className="flex py-1 justify-end items-center gap-3 px-2 border-t border-border-secondary">
            <button
              onClick={handleCloseClick}
              disabled={isLoading}
              className="py-2 text-text px-6 rounded-full bg-blue-500/70"
            >
              Cancel
            </button>
            <button
              disabled={isLoading}
              onClick={() => handleSubmit(quillRef)}
              className="py-2 text-text px-6 rounded-full bg-blue-500"
            >
              {isLoading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                "Comment"
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default RichTextEditor;
