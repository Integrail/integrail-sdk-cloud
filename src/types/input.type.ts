import { z } from "@/prelude/zod";

import { TypeSchema } from "./data.type";
import { FailMode } from "./fail-mode.type";

export const InputMetadataSchema = TypeSchema.and(
  z.object({
    name: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1).nullish(),
    default: z.any().nullable(),
    advanced: z.boolean().nullish(),
    nsfw: z.boolean().nullish(),
    hidden: z.boolean().nullish(),
    failMode: z.nativeEnum(FailMode).nullish(),
  }),
);

export type InputMetadata = z.infer<typeof InputMetadataSchema>;

export const InputsMetadataSchema = z.array(InputMetadataSchema);

export type InputsMetadata = z.infer<typeof InputsMetadataSchema>;
