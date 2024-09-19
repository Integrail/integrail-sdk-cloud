import { AgentExecution, ExecutionEvent } from "@/types/execution.type";
import { MultiAgentId } from "@/types/multi-agent.type";
import { BaseApi } from "@/api/base.api";
import { AccountId } from "@/types/account.type";
import {
  AgentCategoryListResponse,
  AgentExecuteNonStreamingResponse,
  BuiltinAgentExecuteNonStreamingRequest,
  BuiltinAgentExecuteRequest,
  BuiltinAgentExecuteStreamingRequest,
  BuiltinAgentListResponse,
  MultiAgentExecuteRequestSchema,
} from "@/api/common/agent.api";
import "@/polyfills/AbortController"; // Import the polyfill for AbortController
import { jsonl } from "@/helpers/jsonl.helper";
import { z } from "@/prelude/zod";

export class CloudAgentApi extends BaseApi {
  public readonly builtin = new CloudBuiltinAgentApi(this.options);
  public readonly multi = new CloudMultiAgentApi(this.options);
  public readonly category = new CloudAgentCategoryApi(this.options);
}

export class CloudBuiltinAgentApi extends BaseApi {
  public async list(): Promise<BuiltinAgentListResponse> {
    // return BuiltinAgentListResponseSchema.parse(
    return await this.get("api/node/list").then((r) => r.json());
    // );
  }

  public async execute(
    payload: BuiltinAgentExecuteNonStreamingRequest,
  ): Promise<AgentExecuteNonStreamingResponse>;
  public async execute(payload: BuiltinAgentExecuteStreamingRequest): Promise<void>;
  public async execute(
    payload: BuiltinAgentExecuteRequest,
  ): Promise<AgentExecuteNonStreamingResponse | void> {
    if (payload.stream === true) {
      throw new Error("Not implemented.");
    }
    // return AgentExecuteNonStreamingResponseSchema.parse(
    return await this.post(`api/node/execute`, payload).then((r) => r.json());
    // );
  }
}

export class CloudMultiAgentApi extends BaseApi {
  public async execute(
    agentId: MultiAgentId,
    accountId: AccountId,
    payload: CloudMultiAgentExecuteNonStreamingRequest,
  ): Promise<AgentExecuteNonStreamingResponse>;
  public async execute(
    agentId: MultiAgentId,
    accountId: AccountId,
    payload: CloudMultiAgentExecuteStreamingRequest,
    onEvent: (event: ExecutionEvent, execution: AgentExecution | null) => any,
    onFinish?: (execution: AgentExecution | null) => any,
  ): Promise<AbortController>;
  public async execute(
    agentId: MultiAgentId,
    accountId: AccountId,
    payload: CloudMultiAgentExecuteRequest,
    onEvent?: (event: ExecutionEvent, execution: AgentExecution | null) => any,
    onFinish?: (execution: AgentExecution | null) => any,
  ): Promise<AgentExecuteNonStreamingResponse | AbortController> {
    if (payload.stream === true && onEvent != null) {
      const abortController: AbortController = new AbortController();
      const response = await this.fetch(`api/${accountId}/agent/${agentId}/execute`, {
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
        if (!abortController.signal.aborted) await onEvent(event, execution);
      })
        .catch((error) => {
          abortController.abort(error.message);
        })
        .then(() => onFinish?.(execution));
      return abortController;
    }
    // return AgentExecuteNonStreamingResponseSchema.parse(
    return await this.post(`api/${accountId}/agent/${agentId}/execute`, payload).then((r) =>
      r.json(),
    );
    // );
  }
}

export class CloudAgentCategoryApi extends BaseApi {
  public async list(): Promise<AgentCategoryListResponse> {
    // return AgentCategoryListResponseSchema.parse(
    return await this.get("api/node/category/list").then((r) => r.json());
    // );
  }
}

export const CloudMultiAgentExecuteRequestSchema = MultiAgentExecuteRequestSchema.extend({
  externalId: z.string().nullish(),
});
export type CloudMultiAgentExecuteRequest = z.infer<typeof CloudMultiAgentExecuteRequestSchema>;

export const CloudMultiAgentExecuteStreamingRequestSchema = CloudMultiAgentExecuteRequestSchema.and(
  z.object({
    stream: z.literal(true),
  }),
);
export type CloudMultiAgentExecuteStreamingRequest = z.infer<
  typeof CloudMultiAgentExecuteStreamingRequestSchema
>;

export const CloudMultiAgentExecuteNonStreamingRequestSchema =
  CloudMultiAgentExecuteRequestSchema.and(
    z.object({
      stream: z.literal(false).optional(),
    }),
  );
export type CloudMultiAgentExecuteNonStreamingRequest = z.infer<
  typeof CloudMultiAgentExecuteNonStreamingRequestSchema
>;
