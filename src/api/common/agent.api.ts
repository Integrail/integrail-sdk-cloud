import { z } from "@/prelude/zod";
import {
  AgentCategory,
  AgentExecution,
  AgentSubcategory,
  BuiltinAgentSchema,
  ExecutionEvent,
  ExecutionIdSchema,
  InlineMultiAgentSchema,
} from "@/types";
import { BaseApi, BaseResponseSchema } from "@/api/base.api";
import { jsonl } from "@/helpers/jsonl.helper";

export class BaseAgentApi extends BaseApi {
  protected async wrapExecution(
    url: string,
    payload: any,
    onEvent?: (event: ExecutionEvent, execution: AgentExecution | null) => any,
    onFinish?: (execution: AgentExecution | null) => any,
  ): Promise<AbortController | AgentExecuteNonStreamingResponse> {
    if (payload.stream === true && onEvent != null) {
      const abortController: AbortController = new AbortController();
      const response = await this.fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: abortController.signal,
      });
      let execution: AgentExecution | null = null;
      void jsonl(response, async (event) => {
        // const event = ExecutionEventSchema.parse(data);
        if (event.op === "init") execution = event.execution;
        else if (execution != null) {
          execution = AgentExecution.applyEvents({
            ...execution,
            events: [...(execution.events ?? []), event],
          });
        }
        !abortController.signal.aborted && (await onEvent(event, execution));
      })
        .catch((error) => {
          abortController.abort(error.message);
        })
        .then(() => onFinish?.(execution));
      return abortController;
    }
    return AgentExecuteNonStreamingResponseSchema.parse(
      await this.httpPost(url, payload).then((r) => r.json()),
    );
  }

  protected async wrapExecutionMultipart(
    url: string,
    payload: any,
    files: Record<string, Blob>,
    onEvent?: (event: ExecutionEvent, execution: AgentExecution | null) => any,
    onFinish?: (execution: AgentExecution | null) => any,
  ): Promise<AbortController | AgentExecuteNonStreamingResponse> {
    if (payload.stream === true && onEvent != null) {
      const abortController: AbortController = new AbortController();

      const formData = new FormData();
      for (const [key, value] of Object.entries(files)) formData.append(key, value);
      formData.append("payload", JSON.stringify(payload));

      const response = await this.fetch(url, {
        method: "POST",
        body: formData,
        signal: abortController.signal,
      });
      let execution: AgentExecution | null = null;
      void jsonl(response, async (event) => {
        // const event = ExecutionEventSchema.parse(data);
        if (event.op === "init") execution = event.execution;
        else if (execution != null) {
          execution = AgentExecution.applyEvents({
            ...execution,
            events: [...(execution.events ?? []), event],
          });
        }
        !abortController.signal.aborted && (await onEvent(event, execution));
      })
        .catch((error) => {
          abortController.abort(error.message);
        })
        .then(() => onFinish?.(execution));
      return abortController;
    }
    return AgentExecuteNonStreamingResponseSchema.parse(
      await this.httpPost(url, payload).then((r) => r.json()),
    );
  }
}

// Options.

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
