import { z } from "@/prelude/zod";

import { TypeName } from "./data.type";

export const MemoryMetadataFieldType = z.enum([
  TypeName.STRING,
  TypeName.NUMBER,
  TypeName.DATE,
  TypeName.BOOLEAN,
]);

export const MemoryMetadataFieldSchema = z.object({
  fieldName: z.string(),
  fieldType: MemoryMetadataFieldType,
  optional: z.boolean(),
});
export type MemoryMetadataField = z.infer<typeof MemoryMetadataFieldSchema>;

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
  metadata: z.array(MemoryMetadataFieldSchema).nullish(),
});
export type VectorMemory = z.infer<typeof VectorMemorySchema>;
