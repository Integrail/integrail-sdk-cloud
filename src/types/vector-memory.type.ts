import { z } from "@/prelude/zod";

import { TypeName } from "./data.type";

export const MemoryMetadataType = z.enum([
  TypeName.STRING,
  TypeName.NUMBER,
  TypeName.DATE,
  TypeName.BOOLEAN,
]);

export const MemoryMetadata = z.object({
  fieldName: z.string(),
  fieldType: MemoryMetadataType,
  optional: z.boolean(),
});

export const VectorMemorySchema = z.object({
  name: z.string(),
  status: z.string(),
  colName: z.string(),
  embedderId: z.string(),
  indexName: z.string().nullish(),
  vectorFieldName: z.string(),
  vectorSize: z.number().int().nullish(),
  embeddedTextFieldName: z.string(),
  fullTextFieldName: z.string(),
  chunkSize: z.number().int().min(1).nullish(),
  metadata: z.array(MemoryMetadata).nullish(),
});
export type VectorMemory = z.infer<typeof VectorMemorySchema>;
