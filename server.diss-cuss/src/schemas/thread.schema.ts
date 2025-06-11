import { z } from "zod";

export const CreateThreadSchema = z.object({
  content: z.string().min(1, "Content is required"),
  html: z.string(), 
  discussion_id: z.string().uuid("Invalid discussion ID format"),
});

export const CreateReplySchema = z.object({
  content: z.string().min(1, "Content is required"),
  html: z.string(), 
  parent_id : z.string().uuid("Invalid thread ID format"),
  discussion_id: z.string().uuid("Invalid discussion ID format"),
});

export const UpdateLikeSchema = z.object({
  liked: z.union([z.literal(1), z.literal(0), z.literal(-1)]),
  thread_id: z.string().uuid("Invalid thread ID format"),
});

export const discussionThreadSchema = z.object({
  discussion_id : z.string().uuid("Invalid format of id")
})

export const threadSchema = z.object({
  thread_id : z.string().uuid("Invalid format of id")
})
