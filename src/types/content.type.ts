import { Enum } from "@/prelude";

export enum ContentCategory {
  IMAGE = "image",
  AUDIO = "audio",
  VIDEO = "video",
  THREE_DIMENSIONAL = "three-dimensional",
}

export const ContentTypeEnum = Enum.of<
  "name",
  { category: ContentCategory; aliases?: string[]; extensions?: string[] }
>().create({
  // Image.
  JPEG: { name: "image/jpeg", category: ContentCategory.IMAGE, extensions: [".jpg", ".jpeg"] },
  PNG: { name: "image/png", category: ContentCategory.IMAGE, extensions: [".png"] },
  GIF: { name: "image/gif", category: ContentCategory.IMAGE, extensions: [".gif"] },
  BMP: { name: "image/bmp", category: ContentCategory.IMAGE, extensions: [".bmp"] },
  TIFF: { name: "image/tiff", category: ContentCategory.IMAGE, extensions: [".tif", ".tiff"] },
  PPM: { name: "image/x-portable-pixmap", category: ContentCategory.IMAGE, extensions: [".ppm"] },
  WEBP: { name: "image/webp", category: ContentCategory.IMAGE, extensions: [".webp"] },

  // Audio.
  AAC: { name: "audio/aac", category: ContentCategory.AUDIO, extensions: [".aac"] },
  FLAC: { name: "audio/flac", category: ContentCategory.AUDIO, extensions: [".flac"] },
  MP3: {
    name: "audio/mpeg",
    category: ContentCategory.AUDIO,
    aliases: ["audio/mp3"],
    extensions: [".mp3"],
  },
  M4A: {
    name: "audio/mp4",
    category: ContentCategory.AUDIO,
    aliases: ["audio/m4a"],
    extensions: [".m4a"],
  },
  OPUS: { name: "audio/opus", category: ContentCategory.AUDIO, extensions: [".opus"] },
  PCM: { name: "audio/pcm", category: ContentCategory.AUDIO, extensions: [".pcm"] },
  WAV: { name: "audio/wav", category: ContentCategory.AUDIO, extensions: [".wav"] },
  WEBA: { name: "audio/webm", category: ContentCategory.AUDIO, extensions: [".weba"] },

  // Video.
  MP4: { name: "video/mp4", category: ContentCategory.VIDEO, extensions: [".mp4"] },
  WEMB: { name: "video/webm", category: ContentCategory.VIDEO, extensions: [".webm"] },

  // 3D.
  GLB: {
    name: "model/gltf-binary",
    category: ContentCategory.THREE_DIMENSIONAL,
    extensions: [".glb"],
  },
});
export const ContentTypeName = Enum.toNative("name", ContentTypeEnum);
export type ContentTypeName = Enum.Value<"name", typeof ContentTypeEnum>;
export const ContentType = Enum.handler("name", ContentTypeEnum);
export type ContentType = Enum.Variant<"name", typeof ContentTypeEnum>;
