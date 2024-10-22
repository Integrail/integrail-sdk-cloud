import { Enum } from "@/prelude";

// Category.

export const AgentCategoryEnum = Enum.of<"name", { title: string }>().create({
  INPUT: { name: "input", title: "Input" },
  EMBEDDINGS: { name: "embeddings", title: "Embeddings" },
  LLM: { name: "llm", title: "LLM" },
  TTS: { name: "tts", title: "Text to Speech" },
  STT: { name: "stt", title: "Speech to Text" },
  MUSIC: { name: "music", title: "Music" },
  ITT: { name: "itt", title: "Image to Text" },
  TTI: { name: "tti", title: "Text to Image" },
  ITI: { name: "iti", title: "Image to Image" },
  ITV: { name: "itv", title: "Image to Video" },
  TTV: { name: "ttv", title: "Text to Video" },
  WEB: { name: "web", title: "Web" },
  MISC: { name: "misc", title: "Misc" },
  THREE_DIMENSIONAL: { name: "3d", title: "3D" },
  API: { name: "api", title: "API" },
});

export const AgentCategory = Enum.toNative("name", AgentCategoryEnum);
export type AgentCategory = Enum.Value<"name", typeof AgentCategoryEnum>;
export type AgentCategoryVariant = Enum.Variant<"name", typeof AgentCategoryEnum>;

// Subcategory.

export const AgentSubcategoryEnum = Enum.of<
  "name",
  {
    title: string;
    description: string;
    category: AgentCategory;
  }
>().create({
  EMBEDDING: {
    name: "embedding",
    title: "Embedding",
    description: "Embedding",
    category: AgentCategory.EMBEDDINGS,
  },
  LLM_SIMPLE: {
    name: "llm-simple",
    title: "LLM (Simple)",
    description: "Generates text based on text input.",
    category: AgentCategory.LLM,
  },
  LLM_CHAT: {
    name: "llm-chat",
    title: "LLM (Chat)",
    description: "Generates text based on a collection of messages.",
    category: AgentCategory.LLM,
  },
  ITT: {
    name: "itt",
    title: "Image to text",
    description: "Converts image to text.",
    category: AgentCategory.ITT,
  },
  TTI: {
    name: "tti",
    title: "Text to image",
    description: "Converts text to image.",
    category: AgentCategory.TTI,
  },
  TTS: {
    name: "tts",
    title: "Text to speech",
    description: "Converts text to speech.",
    category: AgentCategory.TTS,
  },
  STT: {
    name: "stt",
    title: "Speech to text",
    description: "Converts speech to text.",
    category: AgentCategory.STT,
  },
  MUSIC: {
    name: "music",
    title: "Music",
    description: "Generates music.",
    category: AgentCategory.MUSIC,
  },
  ITV: {
    name: "itv",
    title: "Image to video",
    description: "Converts image to video.",
    category: AgentCategory.ITV,
  },
  TTV: {
    name: "ttv",
    title: "Text to video",
    description: "Converts text to video.",
    category: AgentCategory.TTV,
  },
  UPSCALE: {
    name: "upscale",
    title: "Upscale",
    description: "Upscales image.",
    category: AgentCategory.ITI,
  },
  SKETCH: {
    name: "sketch",
    title: "Sketch",
    description: "Generates image based on sketch.",
    category: AgentCategory.ITI,
  },
  STRUCTURE: {
    name: "structure",
    title: "Structure",
    description: "Generates image while maintaining the structure of the input image.",
    category: AgentCategory.ITI,
  },
  ERASE: {
    name: "erase",
    title: "Erase",
    description: "Erases objects from image.",
    category: AgentCategory.ITI,
  },
  INPAINT: {
    name: "inpaint",
    title: "Inpaint",
    description: "Fills in missing parts of image.",
    category: AgentCategory.ITI,
  },
  OUTPAINT: {
    name: "outpaint",
    title: "Outpaint",
    description: "Generates image based on input image.",
    category: AgentCategory.ITI,
  },
  SEARCH_AND_REPLACE: {
    name: "search-and-replace",
    title: "Search and replace",
    description: "Searches and replaces objects in image.",
    category: AgentCategory.ITI,
  },
  SEARCH_AND_RECOLOR: {
    name: "search-and-recolor",
    title: "Search and recolor",
    description: "Searches and recolors objects in image.",
    category: AgentCategory.ITI,
  },
  REMOVE_BACKGROUND: {
    name: "remove-background",
    title: "Remove background",
    description: "Removes background from image.",
    category: AgentCategory.ITI,
  },
  IMAGE_RESIZE: {
    name: "image-resize",
    title: "Image resize",
    description: "Resizes image.",
    category: AgentCategory.ITI,
  },
  THREE_DIMENSIONAL: {
    name: "3d",
    title: "3D",
    description: "Generates 3D object.",
    category: AgentCategory.THREE_DIMENSIONAL,
  },
  MY_AGENTS: {
    name: "myAgents",
    title: "My Agents",
    description: "Agents created by the user.",
    category: AgentCategory.MISC,
  },
});

export const AgentSubcategory = Enum.toNative("name", AgentSubcategoryEnum);
export type AgentSubcategory = Enum.Value<"name", typeof AgentSubcategoryEnum>;
export type AgentSubcategoryVariant = Enum.Variant<"name", typeof AgentSubcategoryEnum>;
