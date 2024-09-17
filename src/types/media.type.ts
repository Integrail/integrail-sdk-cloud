import { z } from "@/prelude/zod";

import { TypeName } from "./data.type";

export const ImageSchema = z
  .object({ type: z.literal(TypeName.IMAGE) })
  .and(z.union([z.object({ url: z.string().url() }), z.object({ base64: z.string() })]));
export type Image = z.infer<typeof ImageSchema>;

export const AudioSchema = z.object({ type: z.literal(TypeName.AUDIO), url: z.string().url() });
export type Audio = z.infer<typeof AudioSchema>;

export const VideoSchema = z.object({ type: z.literal(TypeName.VIDEO), url: z.string().url() });
export type Video = z.infer<typeof VideoSchema>;

export const FileSchema = z.object({
  type: z.literal(TypeName.FILE),
  url: z.string().url(),
  fileName: z.string(),
});
export type File = z.infer<typeof FileSchema>;

export const ThreeDSchema = z.object({
  type: z.literal(TypeName.THREE_DIMENSIONAL),
  url: z.string().url(),
});
export type ThreeD = z.infer<typeof ThreeDSchema>;
