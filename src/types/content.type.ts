import { Enum } from "@/prelude";

export enum ContentCategory {
  IMAGE = "image",
  AUDIO = "audio",
  VIDEO = "video",
  THREE_DIMENSIONAL = "three-dimensional",
}

export const ContentTypeEnum = Enum.of<
  "name",
  { category: ContentCategory; aliases?: string[] }
>().create({
  // Image.
  JPEG: { name: "image/jpeg", category: ContentCategory.IMAGE },

  // Audio.
  AAC: { name: "audio/aac", category: ContentCategory.AUDIO },
  FLAC: { name: "audio/flac", category: ContentCategory.AUDIO },
  MP3: { name: "audio/mpeg", category: ContentCategory.AUDIO, aliases: ["audio/mp3"] },
  M4A: { name: "audio/mp4", category: ContentCategory.AUDIO, aliases: ["audio/m4a"] },
  OPUS: { name: "audio/opus", category: ContentCategory.AUDIO },
  PCM: { name: "audio/pcm", category: ContentCategory.AUDIO },
  WAV: { name: "audio/wav", category: ContentCategory.AUDIO },
  WEBA: { name: "audio/webm", category: ContentCategory.AUDIO },

  // Video.
  MP4: { name: "video/mp4", category: ContentCategory.VIDEO },
  WEMB: { name: "video/webm", category: ContentCategory.VIDEO },

  // 3D.
  GLB: { name: "model/gltf-binary", category: ContentCategory.THREE_DIMENSIONAL },
});
