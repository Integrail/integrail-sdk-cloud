import { z } from "zod";

export const EmbeddingSchema = z.object({
  _id: z.string(),
  embeddedDescription: z.string(),
  fullDescription: z.string(),
  embedding: z.array(z.number()),
});
export type Embedding = z.infer<typeof EmbeddingSchema>;
