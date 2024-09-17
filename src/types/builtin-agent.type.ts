import { DateStringSchema, z } from "@/prelude/zod";

import { AgentCategory, AgentSubcategory } from "./category.type";
import { InputsMetadataSchema } from "./input.type";
import { OutputsMetadataSchema } from "./output.type";

export type BuiltinAgentName = string;

export enum BuiltinAgentAvailabilityStatus {
  /** Model is fully supported and recommended for use. */
  ACTIVE = "active",
  /** Model no longer receives updates and may be deprecated in the future. */
  LEGACY = "legacy",
  /** Model is not recommended for use, retirement date is assigned. */
  DEPRECATED = "deprecated",

  /** Model is no longer available. */
  // RETIRED = "retired",
}

export const BuiltinAgentAvailabilitySchema = z.object({
  status: z.nativeEnum(BuiltinAgentAvailabilityStatus),
  message: z.string().nullish(),
  deprecation: DateStringSchema.nullish(),
  retirement: DateStringSchema.nullish(),
});
export type BuiltinAgentAvailability = z.infer<typeof BuiltinAgentAvailabilitySchema>;

export const BaseBuiltinAgentSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  shortId: z.string().min(1).max(5).nullish(),
  description: z.string().min(1).nullish(),
  url: z.string().url().nullish(),
  category: z.nativeEnum(AgentCategory),
  subcategory: z.nativeEnum(AgentSubcategory).nullish(),
  hidden: z.boolean().nullish(),
  availability: BuiltinAgentAvailabilitySchema.default({
    status: BuiltinAgentAvailabilityStatus.ACTIVE,
  }),
  metadata: z.any(),
});

export const BuiltinAgentSchema = BaseBuiltinAgentSchema.extend({
  inputs: InputsMetadataSchema,
  outputs: OutputsMetadataSchema,
  // metadata: z.any(),
});
export type BuiltinAgent = z.infer<typeof BuiltinAgentSchema>;
