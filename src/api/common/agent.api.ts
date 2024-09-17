import { z } from "@/prelude/zod";
import {
  AgentCategory,
  AgentSubcategory,
  BuiltinAgentSchema,
  ExecutionIdSchema,
  InlineMultiAgentSchema,
  MultiAgentSchema,
} from "@/types";
import { BaseResponseSchema } from "@/api/base.api";

export type BaseAgentExecutionOptions = Record<string, never>;
export type AgentExecutionOptionsNonStreaming = BaseAgentExecutionOptions & { stream?: false };
export type AgentExecutionOptionsStreaming = BaseAgentExecutionOptions & { stream: true };
export type AgentExecutionOptions =
  | AgentExecutionOptionsNonStreaming
  | AgentExecutionOptionsStreaming;

// Builtin agent list.

export const BuiltinAgentListResponseSchema = z.object({ nodes: z.array(BuiltinAgentSchema) });
export type BuiltinAgentListResponse = z.infer<typeof BuiltinAgentListResponseSchema>;

// Builtin agent category list.

export const AgentCategorySchema = z.object({
  name: z.nativeEnum(AgentCategory),
  title: z.string().min(1),
});
export const AgentSubcategorySchema = z.object({
  name: z.nativeEnum(AgentSubcategory),
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.nativeEnum(AgentCategory),
});
export const AgentCategoryListResponseSchema = BaseResponseSchema.extend({
  categories: z.array(AgentCategorySchema),
  subcategories: z.array(AgentSubcategorySchema),
});
export type AgentCategoryListResponse = z.infer<typeof AgentCategoryListResponseSchema>;

// Agent execute.

export const BaseNonStreamingRequestSchema = z.object({ stream: z.literal(false).optional() });
export const BaseStreamingRequestSchema = z.object({ stream: z.literal(true) });

export const BuiltinAgentExecuteRequestSchema = z.object({
  nodeName: z.string().min(1),
  inputs: z.record(z.any()),
  stream: z.boolean().optional(),
});
export type BuiltinAgentExecuteRequest = z.infer<typeof BuiltinAgentExecuteRequestSchema>;

export const BuiltinAgentExecuteStreamingRequestSchema = BuiltinAgentExecuteRequestSchema.and(
  z.object({
    stream: z.literal(true),
  }),
);
export type BuiltinAgentExecuteStreamingRequest = z.infer<typeof BuiltinAgentExecuteRequestSchema>;

export const BuiltinAgentExecuteNonStreamingRequestSchema = BuiltinAgentExecuteRequestSchema.and(
  z.object({
    stream: z.literal(false).optional(),
  }),
);
export type BuiltinAgentExecuteNonStreamingRequest = z.infer<
  typeof BuiltinAgentExecuteRequestSchema
>;

export const MultiAgentExecuteRequestSchema = z.object({
  inputs: z.record(z.any()),
  stream: z.boolean().optional(),
});
export type MultiAgentExecuteRequest = z.infer<typeof MultiAgentExecuteRequestSchema>;

export const MultiAgentExecuteStreamingRequestSchema = MultiAgentExecuteRequestSchema.and(
  z.object({
    stream: z.literal(true),
  }),
);
export type MultiAgentExecuteStreamingRequest = z.infer<typeof MultiAgentExecuteRequestSchema>;

export const MultiAgentExecuteNonStreamingRequestSchema = MultiAgentExecuteRequestSchema.and(
  z.object({
    stream: z.literal(false).optional(),
  }),
);
export type MultiAgentExecuteNonStreamingRequest = z.infer<typeof MultiAgentExecuteRequestSchema>;

export const MultiAgentExecuteInlineRequestSchema = z.object({
  inputs: z.record(z.any()),
  pipeline: InlineMultiAgentSchema,
  stream: z.boolean().optional(),
});
export type MultiAgentExecuteInlineRequest = z.infer<typeof MultiAgentExecuteInlineRequestSchema>;

export const MultiAgentExecuteInlineStreamingRequestSchema =
  MultiAgentExecuteInlineRequestSchema.and(
    z.object({
      stream: z.literal(true),
    }),
  );
export type MultiAgentExecuteInlineStreamingRequest = z.infer<
  typeof MultiAgentExecuteInlineRequestSchema
>;

export const MultiAgentExecuteInlineNonStreamingRequestSchema =
  MultiAgentExecuteInlineRequestSchema.and(
    z.object({
      stream: z.literal(false).optional(),
    }),
  );
export type MultiAgentExecuteInlineNonStreamingRequest = z.infer<
  typeof MultiAgentExecuteInlineRequestSchema
>;

export const AgentExecuteNonStreamingResponseSchema = BaseResponseSchema.extend({
  executionId: ExecutionIdSchema,
});
export type AgentExecuteNonStreamingResponse = z.infer<
  typeof AgentExecuteNonStreamingResponseSchema
>;
