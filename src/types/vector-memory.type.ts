import { z } from "@/prelude/zod";

export const VectorMemorySchema = z.object({
  name: z.string(),
  status: z.string(),
  colName: z.string(),
  embedderId: z.string(),
  indexName: z.string().nullish(),
  vectorFieldName: z.string(),
  embeddedTextFieldName: z.string(),
  fullTextFieldName: z.string(),
});
export type VectorMemory = z.infer<typeof VectorMemorySchema>;
