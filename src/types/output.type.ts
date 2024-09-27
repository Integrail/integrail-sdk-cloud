import { z } from "@/prelude/zod";

import { TypeSchema } from "./data.type";

export const OutputMetadataSchema = TypeSchema.and(
  z.object({
    name: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1).nullish(),
    default: z.any().nullish(),
    saveHistory: z.boolean().nullish(),
  }),
);

export type OutputMetadata = z.infer<typeof OutputMetadataSchema>;

export const OutputsMetadataSchema = z.array(OutputMetadataSchema);

export type OutputsMetadata = z.infer<typeof OutputsMetadataSchema>;
