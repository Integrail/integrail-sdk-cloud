import { z } from "@/prelude/zod";
import {
  AgentCategory,
  AgentExecution,
  AgentSubcategory,
  NodeDefinitionSchema,
  ExecutionEvent,
  ExecutionIdSchema,
  InlineAgentSchema,
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

// Node definition list.

export const NodeDefinitionListResponseSchema = z.object({ nodes: z.array(NodeDefinitionSchema) });
export type NodeDefinitionListResponse = z.infer<typeof NodeDefinitionListResponseSchema>;

// Node definition category list.

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

export const SingleNodeExecuteRequestSchema = z.object({
  nodeName: z.string().min(1),
  inputs: z.record(z.any()),
  stream: z.boolean().optional(),
});
export type SingleNodeExecuteRequest = z.infer<typeof SingleNodeExecuteRequestSchema>;

export const SingleNodeExecuteStreamingRequestSchema = SingleNodeExecuteRequestSchema.and(
  z.object({
    stream: z.literal(true),
  }),
);
export type SingleNodeExecuteStreamingRequest = z.infer<typeof SingleNodeExecuteRequestSchema>;

export const SingleNodeExecuteNonStreamingRequestSchema = SingleNodeExecuteRequestSchema.and(
  z.object({
    stream: z.literal(false).optional(),
  }),
);
export type SingleNodeExecuteNonStreamingRequest = z.infer<typeof SingleNodeExecuteRequestSchema>;

export const AgentExecuteRequestSchema = z.object({
  inputs: z.record(z.any()),
  stream: z.boolean().optional(),
});
export type AgentExecuteRequest = z.infer<typeof AgentExecuteRequestSchema>;

export const AgentExecuteStreamingRequestSchema = AgentExecuteRequestSchema.and(
  z.object({
    stream: z.literal(true),
  }),
);
export type AgentExecuteStreamingRequest = z.infer<typeof AgentExecuteRequestSchema>;

export const AgentExecuteNonStreamingRequestSchema = AgentExecuteRequestSchema.and(
  z.object({
    stream: z.literal(false).optional(),
  }),
);
export type AgentExecuteNonStreamingRequest = z.infer<typeof AgentExecuteRequestSchema>;

export const AgentExecuteInlineRequestSchema = z.object({
  inputs: z.record(z.any()),
  pipeline: InlineAgentSchema,
  stream: z.boolean().optional(),
});
export type AgentExecuteInlineRequest = z.infer<typeof AgentExecuteInlineRequestSchema>;

export const AgentExecuteInlineStreamingRequestSchema = AgentExecuteInlineRequestSchema.and(
  z.object({
    stream: z.literal(true),
  }),
);
export type AgentExecuteInlineStreamingRequest = z.infer<typeof AgentExecuteInlineRequestSchema>;

export const AgentExecuteInlineNonStreamingRequestSchema = AgentExecuteInlineRequestSchema.and(
  z.object({
    stream: z.literal(false).optional(),
  }),
);
export type AgentExecuteInlineNonStreamingRequest = z.infer<typeof AgentExecuteInlineRequestSchema>;

export const AgentExecuteNonStreamingResponseSchema = BaseResponseSchema.extend({
  executionId: ExecutionIdSchema,
});
export type AgentExecuteNonStreamingResponse = z.infer<
  typeof AgentExecuteNonStreamingResponseSchema
>;
