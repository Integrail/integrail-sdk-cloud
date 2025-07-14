import { z } from "@/prelude/zod";

import { ExecutionStatsSchema } from "./stats.type";

export enum OutputStateStatus {
  PENDING = "pending",
  RUNNING = "running",
  STREAMING = "streaming", // New status for real-time streaming updates
  FINISHED = "finished",
  CANCELLED = "cancelled",
  ERROR = "error", // New status for error states
}

export const OutputStateSchema = z.object({
  status: z.nativeEnum(OutputStateStatus),
  value: z.any(),
});

export type OutputState = z.infer<typeof OutputStateSchema>;

export enum NodeExecutionStatus {
  // Waiting.
  PENDING = "pending",
  RETRY = "retry",

  // Starting.
  STARTING = "starting",

  // Started.
  RUNNING = "running",

  // Real-time async operations.
  STREAMING_OUT = "streaming_out", // Node is outputting data in real-time (e.g., microphone input)
  STREAMING_IN = "streaming_in", // Node is receiving streaming data (e.g., LLM waiting for transcription)

  // Ended.
  FINISHED = "finished",
  CANCELLED = "cancelled",
  ERROR = "error",
}

export const NodeExecutionStateSchema = z.object({
  status: z.nativeEnum(NodeExecutionStatus),
  inputs: z.record(z.any()).nullish(),
  outputs: z.record(OutputStateSchema.nullish()).nullish(),
  updatedAt: z.coerce.date(),
  errors: z.array(z.any()).nullish(),
  message: z.string().nullish(),
  retries: z.number().int().nonnegative(),
  stats: ExecutionStatsSchema.nullish(),
  failBranch: z.boolean().nullish(),
});

export type NodeExecutionState = z.infer<typeof NodeExecutionStateSchema>;

export namespace NodeExecutionState {
  /** Waiting to be scheduler. */
  export function isWaiting(state: NodeExecutionState): boolean {
    return state.status === NodeExecutionStatus.PENDING;
  }

  /** Scheduled for execution. */
  export function isStarting(state: NodeExecutionState): boolean {
    return (
      state.status === NodeExecutionStatus.STARTING || state.status === NodeExecutionStatus.RETRY
    );
  }

  /** Execution started. */
  export function isStarted(state: NodeExecutionState): boolean {
    return (
      state.status === NodeExecutionStatus.RUNNING ||
      state.status === NodeExecutionStatus.STREAMING_OUT ||
      state.status === NodeExecutionStatus.STREAMING_IN
    );
  }

  /** Execution ended. */
  export function isEnded(state: NodeExecutionState): boolean {
    return (
      state.status === NodeExecutionStatus.FINISHED ||
      state.status === NodeExecutionStatus.ERROR ||
      state.status === NodeExecutionStatus.CANCELLED
    );
  }

  export function isFailed(state: NodeExecutionState): boolean {
    return (
      state.status === NodeExecutionStatus.ERROR || state.status === NodeExecutionStatus.CANCELLED
    );
  }

  export function isSucceeded(state: NodeExecutionState): boolean {
    return state.status === NodeExecutionStatus.FINISHED;
  }

  /** Node is in streaming mode (async operations). */
  export function isStreaming(state: NodeExecutionState): boolean {
    return (
      state.status === NodeExecutionStatus.STREAMING_OUT ||
      state.status === NodeExecutionStatus.STREAMING_IN
    );
  }
}
