import { AgentExecution, ExecutionEvent } from "@/types/execution.type";
import { AgentId } from "@/types/agent.type";
import { BaseApi } from "@/api/base.api";
import { AccountId } from "@/types/account.type";
import {
  AgentCategoryListResponse,
  AgentCategoryListResponseSchema,
  AgentExecuteNonStreamingResponse,
  BaseAgentApi,
  AgentExecuteRequestSchema,
} from "@/api/common/agent.api";
import "@/polyfills/AbortController";
import { z } from "@/prelude/zod";

export class CloudAgentApi extends BaseAgentApi {
  public get multi(): CloudAgentApi {
    return this;
  }

  public async execute(
    agentId: AgentId,
    accountId: AccountId,
    payload: CloudAgentExecuteNonStreamingRequest,
  ): Promise<AgentExecuteNonStreamingResponse>;
  public async execute(
    agentId: AgentId,
    accountId: AccountId,
    payload: CloudAgentExecuteStreamingRequest,
    onEvent: (event: ExecutionEvent, execution: AgentExecution | null) => any,
    onFinish?: (execution: AgentExecution | null) => any,
  ): Promise<AbortController>;
  public async execute(
    agentId: AgentId,
    accountId: AccountId,
    payload: CloudAgentExecuteRequest,
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
    agentId: AgentId,
    accountId: AccountId,
    payload: CloudAgentExecuteNonStreamingRequest,
    files: Record<string, Blob>,
  ): Promise<AgentExecuteNonStreamingResponse>;
  public async executeMultipart(
    agentId: AgentId,
    accountId: AccountId,
    payload: CloudAgentExecuteStreamingRequest,
    files: Record<string, Blob>,
    onEvent: (event: ExecutionEvent, execution: AgentExecution | null) => any,
    onFinish?: (execution: AgentExecution | null) => any,
  ): Promise<AbortController>;
  public async executeMultipart(
    agentId: AgentId,
    accountId: AccountId,
    payload: CloudAgentExecuteRequest,
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

export class CloudCategoryApi extends BaseApi {
  public async list(): Promise<AgentCategoryListResponse> {
    return AgentCategoryListResponseSchema.parse(
      await this.httpGet("api/node/category/list").then((r) => r.json()),
    );
  }
}

export const CloudAgentExecuteRequestSchema = AgentExecuteRequestSchema.extend({
  externalId: z.string().nullish(),
});
export type CloudAgentExecuteRequest = z.infer<typeof CloudAgentExecuteRequestSchema>;

export const CloudAgentExecuteStreamingRequestSchema = CloudAgentExecuteRequestSchema.extend({
  stream: z.literal(true),
});
export type CloudAgentExecuteStreamingRequest = z.infer<
  typeof CloudAgentExecuteStreamingRequestSchema
>;

export const CloudAgentExecuteNonStreamingRequestSchema = CloudAgentExecuteRequestSchema.extend({
  stream: z.literal(false).optional(),
});
export type CloudAgentExecuteNonStreamingRequest = z.infer<
  typeof CloudAgentExecuteNonStreamingRequestSchema
>;
