import { ExecutionEvent, AgentExecution } from "@/types";
import {
  BaseAgentApi,
  NodeDefinitionListResponse,
  NodeDefinitionListResponseSchema,
  SingleNodeExecuteNonStreamingRequest,
  AgentExecuteNonStreamingResponse,
  SingleNodeExecuteStreamingRequest,
  SingleNodeExecuteRequest,
} from "@/api/common/agent.api";

export class CloudNodeApi extends BaseAgentApi {
  public async list(): Promise<NodeDefinitionListResponse> {
    return NodeDefinitionListResponseSchema.parse(
      await this.httpGet("api/node/list").then((r) => r.json()),
    );
  }

  public async execute(
    payload: SingleNodeExecuteNonStreamingRequest,
  ): Promise<AgentExecuteNonStreamingResponse>;
  public async execute(
    payload: SingleNodeExecuteStreamingRequest,
    onEvent?: (event: ExecutionEvent, execution: AgentExecution | null) => any,
    onFinish?: (execution: AgentExecution | null) => any,
  ): Promise<AbortController>;
  public async execute(
    payload: SingleNodeExecuteRequest,
    onEvent?: (event: ExecutionEvent, execution: AgentExecution | null) => any,
    onFinish?: (execution: AgentExecution | null) => any,
  ): Promise<AgentExecuteNonStreamingResponse | AbortController> {
    return await this.wrapExecution("api/node/execute", payload, onEvent, onFinish);
  }
}
