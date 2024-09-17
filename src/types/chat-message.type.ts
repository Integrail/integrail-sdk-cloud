import { z } from "@/prelude/zod";

import { ValueSchema } from "./value.type";

export enum ChatMessageRole {
  ASSISTANT = "assistant",
  USER = "user",
}

export const ChatMessagePartSchema = ValueSchema.and(
  z.object({
    name: z.string().optional(),
  }),
);
export type ChatMessagePart = z.infer<typeof ChatMessagePartSchema>;

export const ChatMessageSchema = z.object({
  role: z.nativeEnum(ChatMessageRole),
  parts: z.array(ChatMessagePartSchema),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
