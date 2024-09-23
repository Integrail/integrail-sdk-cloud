import { AgentExecution, ExecutionEvent } from "@/types/execution.type";
import { MultiAgentId } from "@/types/multi-agent.type";
import { BaseApi } from "@/api/base.api";
import { AccountId } from "@/types/account.type";
import {
  AgentCategoryListResponse,
  AgentCategoryListResponseSchema,
  AgentExecuteNonStreamingResponse,
  BaseAgentApi,
  BuiltinAgentExecuteNonStreamingRequest,
  BuiltinAgentExecuteRequest,
  BuiltinAgentExecuteStreamingRequest,
  BuiltinAgentListResponse,
  BuiltinAgentListResponseSchema,
  MultiAgentExecuteRequestSchema,
} from "@/api/common/agent.api";
import "@/polyfills/AbortController";
import { z } from "@/prelude/zod";

export class CloudAgentApi extends BaseApi {
  public readonly builtin = new CloudBuiltinAgentApi(this.options);
  public readonly multi = new CloudMultiAgentApi(this.options);
  public readonly category = new CloudAgentCategoryApi(this.options);
}

export class CloudBuiltinAgentApi extends BaseAgentApi {
  public async list(): Promise<BuiltinAgentListResponse> {
    return BuiltinAgentListResponseSchema.parse(
      await this.httpGet("api/node/list").then((r) => r.json()),
    );
  }

  public async execute(
    payload: BuiltinAgentExecuteNonStreamingRequest,
  ): Promise<AgentExecuteNonStreamingResponse>;
  public async execute(
    payload: BuiltinAgentExecuteStreamingRequest,
    onEvent?: (event: ExecutionEvent, execution: AgentExecution | null) => any,
    onFinish?: (execution: AgentExecution | null) => any,
  ): Promise<AbortController>;
  public async execute(
    payload: BuiltinAgentExecuteRequest,
    onEvent?: (event: ExecutionEvent, execution: AgentExecution | null) => any,
    onFinish?: (execution: AgentExecution | null) => any,
  ): Promise<AgentExecuteNonStreamingResponse | AbortController> {
    return await this.wrapExecution("api/node/execute", payload, onEvent, onFinish);
  }
}

export class CloudMultiAgentApi extends BaseAgentApi {
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
    return await this.wrapExecution(
      `api/${accountId}/agent/${agentId}/execute`,
      payload,
      onEvent,
      onFinish,
    );
  }

  public async executeMultipart(
    agentId: MultiAgentId,
    accountId: AccountId,
    payload: CloudMultiAgentExecuteNonStreamingRequest,
    files: Record<string, Blob>,
  ): Promise<AgentExecuteNonStreamingResponse>;
  public async executeMultipart(
    agentId: MultiAgentId,
    accountId: AccountId,
    payload: CloudMultiAgentExecuteStreamingRequest,
    files: Record<string, Blob>,
    onEvent: (event: ExecutionEvent, execution: AgentExecution | null) => any,
    onFinish?: (execution: AgentExecution | null) => any,
  ): Promise<AbortController>;
  public async executeMultipart(
    agentId: MultiAgentId,
    accountId: AccountId,
    payload: CloudMultiAgentExecuteRequest,
    files: Record<string, Blob>,
    onEvent?: (event: ExecutionEvent, execution: AgentExecution | null) => any,
    onFinish?: (execution: AgentExecution | null) => any,
  ): Promise<AgentExecuteNonStreamingResponse | AbortController> {
    return await this.wrapExecutionMultipart(
      `api/${accountId}/agent/${agentId}/execute/multipart`,
      payload,
      files,
      onEvent,
      onFinish,
    );
  }
}

export class CloudAgentCategoryApi extends BaseApi {
  public async list(): Promise<AgentCategoryListResponse> {
    return AgentCategoryListResponseSchema.parse(
      await this.httpGet("api/node/category/list").then((r) => r.json()),
    );
  }
}

export const CloudMultiAgentExecuteRequestSchema = MultiAgentExecuteRequestSchema.extend({
  externalId: z.string().nullish(),
});
export type CloudMultiAgentExecuteRequest = z.infer<typeof CloudMultiAgentExecuteRequestSchema>;

export const CloudMultiAgentExecuteStreamingRequestSchema =
  CloudMultiAgentExecuteRequestSchema.extend({
    stream: z.literal(true),
  });
export type CloudMultiAgentExecuteStreamingRequest = z.infer<
  typeof CloudMultiAgentExecuteStreamingRequestSchema
>;

export const CloudMultiAgentExecuteNonStreamingRequestSchema =
  CloudMultiAgentExecuteRequestSchema.extend({
    stream: z.literal(false).optional(),
  });
export type CloudMultiAgentExecuteNonStreamingRequest = z.infer<
  typeof CloudMultiAgentExecuteNonStreamingRequestSchema
>;
