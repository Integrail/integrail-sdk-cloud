import { z } from "@/prelude/zod";
import {
  AgentExecutionSchema,
  ExecutionId,
  AgentExecution,
  ExecutionEvent,
  ExecutionIdSchema,
  BaseEventSchema,
} from "@/types";
import { BaseResponseSchema, BaseApi } from "@/api/base.api";
import { jsonl } from "@/helpers/jsonl.helper";

export const ExecutionStatusResponseSchema = BaseResponseSchema.extend({
  execution: AgentExecutionSchema,
});
export type ExecutionStatusResponse = z.infer<typeof ExecutionStatusResponseSchema>;

export class CloudExecutionApi extends BaseApi {
  public async status(executionId: ExecutionId): Promise<ExecutionStatusNonStreamingResponse>;
  public async status(
    executionId: ExecutionId,
    stream: true,
    onEvent: (event: ExecutionEvent, execution: AgentExecution | null) => any,
    onFinish?: (execution: AgentExecution | null) => any,
  ): Promise<AbortController>;
  public async status(
    executionId: ExecutionId,
    stream?: boolean,
    onEvent?: (event: ExecutionEvent, execution: AgentExecution | null) => any,
    onFinish?: (execution: AgentExecution | null) => any,
  ): Promise<AbortController | ExecutionStatusNonStreamingResponse> {
    if (stream === true && onEvent != null) {
      const abortController: AbortController = new AbortController();
      const response = await this.fetch(`api/execution/${executionId}/status?stream=true`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: abortController.signal,
      });
      let execution: AgentExecution | null = null;
      void jsonl(response, async (data) => {
        const event = BaseEventSchema.passthrough().parse(data) as ExecutionEvent;
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
    return ExecutionStatusNonStreamingResponseSchema.parse(
      await this.httpGet(`api/execution/${executionId}/status`).then((r) => r.json()),
    );
  }
}

export const ExecutionStatusNonStreamingResponseSchema = BaseResponseSchema.extend({
  executionId: ExecutionIdSchema,
});
export type ExecutionStatusNonStreamingResponse = z.infer<
  typeof ExecutionStatusNonStreamingResponseSchema
>;
