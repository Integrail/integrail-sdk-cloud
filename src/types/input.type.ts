import { z } from "@/prelude/zod";

import { TypeSchema } from "./data.type";
import { FailMode } from "./fail-mode.type";

export const InputMetadataSchema = TypeSchema.and(
  z.object({
    name: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1).optional(),
    default: z.any().nullable(),
    advanced: z.boolean().optional(),
    nsfw: z.boolean().optional(),
    hidden: z.boolean().optional(),
    failMode: z.nativeEnum(FailMode).optional(),
  }),
);

export type InputMetadata = z.infer<typeof InputMetadataSchema>;

export const InputsMetadataSchema = z.array(InputMetadataSchema);

export type InputsMetadata = z.infer<typeof InputsMetadataSchema>;
