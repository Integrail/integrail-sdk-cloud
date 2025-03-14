import { z } from "@/prelude/zod";

import { GlobalOverrides } from "./override.type";
import { AgentSchema } from "./agent.type";
import { NodeId } from "./node.type";
import {
  NodeExecutionState,
  NodeExecutionStateSchema,
  NodeExecutionStatus,
  OutputState,
  OutputStateStatus,
} from "./node-execution.type";
import { ExecutionStats, ExecutionStatsSchema } from "./stats.type";

export const ExecutionIdSchema = z.string().min(1).openapi({ example: "487469a73986" });
export type ExecutionId = z.infer<typeof ExecutionIdSchema>;

export enum AgentExecutionStatus {
  PENDING = "pending",
  RUNNING = "running",
  CANCELLING = "cancelling",
  CANCELLED = "cancelled",
  FINISHED = "finished",
  ERROR = "error",
}

export const BaseEventSchema = z.object({
  executionId: ExecutionIdSchema,
  createdAt: z.coerce.date(),
});

export enum ExecutionEventOp {
  // Agent level.
  INIT = "init",
  UPDATE_STATUS = "updateStatus",

  // Agent output level.
  OUTPUT_UPDATE = "output.update",

  // Node level.
  NODE_UPDATE_STATUS = "node.updateStatus",

  // Node output level.
  NODE_OUTPUT_UPDATE_STATUS = "node.output.updateStatus",
  NODE_OUTPUT_UPDATE = "node.output.update",

  PING = "ping",
  LOG = "log",
}

const InitEventSchema = BaseEventSchema.extend({
  op: z.literal(ExecutionEventOp.INIT),
  execution: z.any(),
});
type InitEvent = z.infer<typeof InitEventSchema>;
const UpdateStatusEventSchema = BaseEventSchema.extend({
  op: z.literal(ExecutionEventOp.UPDATE_STATUS),
  status: z.nativeEnum(AgentExecutionStatus),
  message: z.string().nullish(),
  _errors: z.array(z.any()).nullish(),
});
const AgentEventSchema = z.discriminatedUnion("op", [InitEventSchema, UpdateStatusEventSchema]);
type AgentEvent = z.infer<typeof AgentEventSchema>;

const OutputUpdateEventSchema = BaseEventSchema.extend({
  op: z.literal(ExecutionEventOp.OUTPUT_UPDATE),
  output: z.string().min(1),
  value: z.any(),
  append: z.boolean().nullish(),
});
const OutputEventSchema = OutputUpdateEventSchema;
type OutputEvent = z.infer<typeof OutputEventSchema>;

const NodeUpdateStatusEventSchema = BaseEventSchema.extend({
  op: z.literal(ExecutionEventOp.NODE_UPDATE_STATUS),
  nodeId: z.string().min(1),
  status: z.nativeEnum(NodeExecutionStatus),
  message: z.string().nullish(),
  errors: z.array(z.any()).nullish(),
  stats: ExecutionStatsSchema.nullish(),
  retries: z.number().int().nonnegative().nullish(),
});
const NodeEventSchema = NodeUpdateStatusEventSchema;
type NodeEvent = z.infer<typeof NodeEventSchema>;

const NodeOutputUpdateStatusEventSchema = BaseEventSchema.extend({
  op: z.literal(ExecutionEventOp.NODE_OUTPUT_UPDATE_STATUS),
  nodeId: z.string().min(1),
  output: z.string().min(1),
  status: z.nativeEnum(OutputStateStatus),
});
const NodeOutputUpdateEventSchema = BaseEventSchema.extend({
  op: z.literal(ExecutionEventOp.NODE_OUTPUT_UPDATE),
  nodeId: z.string().min(1),
  output: z.string().min(1),
  status: z.nativeEnum(OutputStateStatus),
  value: z.any(),
  append: z.boolean().nullish(),
});
const NodeOutputEventSchema = z.discriminatedUnion("op", [
  NodeOutputUpdateStatusEventSchema,
  NodeOutputUpdateEventSchema,
]);
type NodeOutputEvent = z.infer<typeof NodeOutputEventSchema>;

const PingEventSchema = BaseEventSchema.extend({
  op: z.literal(ExecutionEventOp.PING),
});
const LogEventSchema = BaseEventSchema.extend({
  op: z.literal(ExecutionEventOp.LOG),
  level: z.enum(["error", "warn", "info", "debug"]),
  statusText: z.enum(["set", "clear"]).nullish(),
  nodeId: z.string().nullish(),
  output: z.string().nullish(),
  message: z.string(),
  data: z.any().nullish(),
});
export type LogEvent = z.infer<typeof LogEventSchema>;

export const ExecutionEventSchema = z.discriminatedUnion("op", [
  // Agent level.
  InitEventSchema,
  UpdateStatusEventSchema,

  // Agent output level.
  OutputUpdateEventSchema,

  // Node level.
  NodeUpdateStatusEventSchema,

  // Node output level.
  NodeOutputUpdateEventSchema,
  NodeOutputUpdateStatusEventSchema,

  // Misc.
  PingEventSchema,
  LogEventSchema,
]);
export type ExecutionEvent = z.infer<typeof ExecutionEventSchema>;

export const AgentExecutionSchema = z.object({
  _id: ExecutionIdSchema,
  status: z.nativeEnum(AgentExecutionStatus),
  updatedAt: z.coerce.date(),
  queuedAt: z.coerce.date().nullish(),
  startedAt: z.coerce.date().nullish(),
  finishedAt: z.coerce.date().nullish(),
  pipelineId: z.string().min(1).nullish(),
  pipeline: AgentSchema,
  externalId: z.string().nullish(),
  state: z.record(NodeExecutionStateSchema),
  stats: ExecutionStatsSchema.nullish(),
  inputs: z.record(z.any()),
  outputs: z.record(z.any()).nullish(),
  events: z.array(ExecutionEventSchema).nullish(),
  message: z.string().nullish(),
  _errors: z.array(z.any()).nullish(),
  parentExecutionId: z.string().nullish(),
  globalOverrides: z.custom<GlobalOverrides>().optional(),
});
export type AgentExecution = z.infer<typeof AgentExecutionSchema>;

export namespace AgentExecution {
  export function isEnded(execution: AgentExecution): boolean {
    return (
      execution.status === AgentExecutionStatus.FINISHED ||
      execution.status === AgentExecutionStatus.ERROR
    );
  }

  export function update(
    execution: AgentExecution,
    f: (execution: AgentExecution) => AgentExecution,
    getTimestamp: () => Date = (): Date => new Date(),
  ): AgentExecution {
    execution = f(execution);
    const stats: ExecutionStats = {};
    for (const nodeId in execution.state) {
      const nodeState = execution.state[nodeId];
      const nodeStats = nodeState.stats ?? {};
      for (const statsKey in nodeStats) {
        stats[statsKey] = (stats[statsKey] ?? 0) + nodeStats[statsKey];
      }
    }
    return {
      ...execution,
      stats,
      startedAt: execution.startedAt ?? new Date(),
      updatedAt: getTimestamp(),
      finishedAt:
        AgentExecution.isEnded(execution) && execution.finishedAt == null
          ? getTimestamp()
          : execution.finishedAt,
    };
  }

  export function updateAgentOutput(
    execution: AgentExecution,
    outputName: string,
    f: (outputValue: any) => any,
    getTimestamp: () => Date = (): Date => new Date(),
  ): AgentExecution {
    return update(
      execution,
      (execution) => {
        const output = execution.outputs?.[outputName] ?? null;
        return {
          ...execution,
          outputs: { ...execution.outputs, [outputName]: f(output) },
        };
      },
      getTimestamp,
    );
  }

  export function updateNode(
    execution: AgentExecution,
    nodeId: NodeId,
    f: (node: NodeExecutionState | null) => NodeExecutionState,
    getTimestamp: () => Date = (): Date => new Date(),
  ): AgentExecution {
    return update(
      execution,
      (execution) => {
        const nodeState = execution.state[nodeId] ?? null;
        return {
          ...execution,
          state: { ...execution.state, [nodeId]: { ...f(nodeState), updatedAt: getTimestamp() } },
        };
      },
      getTimestamp,
    );
  }

  export function updateNodeOutput(
    execution: AgentExecution,
    nodeId: NodeId,
    outputName: string,
    f: (output: OutputState | null) => OutputState,
    getTimestamp: () => Date = (): Date => new Date(),
  ): AgentExecution {
    return updateNode(
      execution,
      nodeId,
      (nodeState: NodeExecutionState | null): NodeExecutionState => {
        let newOutputState: OutputState | null = null;
        if (nodeState != null) {
          const outputState = nodeState.outputs?.[outputName];
          if (outputState != null) newOutputState = f(outputState);
        }
        if (newOutputState == null) newOutputState = f(null);
        return {
          ...(nodeState ?? {
            status: NodeExecutionStatus.RUNNING,
            retries: 1,
            updatedAt: getTimestamp(),
          }),
          outputs: {
            ...nodeState?.outputs,
            [outputName]: newOutputState,
          },
        };
      },
      getTimestamp,
    );
  }

  export function init(event: InitEvent): AgentExecution {
    // return AgentExecutionSchema.passthrough().parse(event.execution);
    return event.execution;
  }

  export function applyEvents(execution: AgentExecution): AgentExecution {
    if (execution.events == null) return execution;
    const events = [...execution.events];
    events.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    for (const event of execution.events) {
      execution = applyEvent(execution, event);
    }
    return { ...execution, events: [] };
  }

  export function applyEvent(execution: AgentExecution, event: ExecutionEvent): AgentExecution {
    if (execution._id !== event.executionId) return execution;
    switch (event.op) {
      case ExecutionEventOp.INIT:
        return init(event);
      case ExecutionEventOp.UPDATE_STATUS:
        return applyAgentEvent(execution, event);
      case ExecutionEventOp.OUTPUT_UPDATE:
        return applyAgentOutputEvent(execution, event);
      case ExecutionEventOp.NODE_UPDATE_STATUS:
        return applyNodeEvent(execution, event);
      case ExecutionEventOp.NODE_OUTPUT_UPDATE_STATUS:
      case ExecutionEventOp.NODE_OUTPUT_UPDATE:
        return applyNodeOutputEvent(execution, event);
      default:
        return execution;
    }
  }

  function applyAgentEvent(execution: AgentExecution, event: AgentEvent): AgentExecution {
    return update(
      execution,
      (execution): AgentExecution => {
        switch (event.op) {
          case ExecutionEventOp.INIT:
            return execution;
          case ExecutionEventOp.UPDATE_STATUS:
            return {
              ...execution,
              status: event.status,
              message: event.message ?? execution.message,
              _errors: event._errors ?? execution._errors,
            };
        }
      },
      () => event.createdAt,
    );
  }

  function applyAgentOutputEvent(execution: AgentExecution, event: OutputEvent): AgentExecution {
    return updateAgentOutput(
      execution,
      event.output,
      (outputValue) => {
        switch (event.op) {
          case ExecutionEventOp.OUTPUT_UPDATE:
            if (event.append === true) {
              return `${outputValue ?? ""}${event.value}`;
            }
            return event.value;
        }
      },
      () => event.createdAt,
    );
  }

  function applyNodeEvent(execution: AgentExecution, event: NodeEvent): AgentExecution {
    return updateNode(
      execution,
      event.nodeId,
      (node) => {
        node = node ?? { status: NodeExecutionStatus.PENDING, retries: 1, updatedAt: new Date() };
        switch (event.op) {
          case ExecutionEventOp.NODE_UPDATE_STATUS:
            return {
              ...node,
              status: event.status,
              retries: event.retries ?? node.retries,
              message: event.message ?? node.message,
              errors: event.errors ?? node.errors,
              stats: event.stats ?? node.stats,
            };
        }
      },
      () => event.createdAt,
    );
  }

  function applyNodeOutputEvent(execution: AgentExecution, event: NodeOutputEvent): AgentExecution {
    return updateNodeOutput(
      execution,
      event.nodeId,
      event.output,
      (outputState) => {
        outputState = outputState ?? { status: OutputStateStatus.PENDING };
        switch (event.op) {
          case ExecutionEventOp.NODE_OUTPUT_UPDATE_STATUS: {
            return {
              status: event.status,
              value: outputState.value,
            };
          }
          case ExecutionEventOp.NODE_OUTPUT_UPDATE:
            if (event.append === true) {
              return {
                status: event.status,
                value: `${outputState.value ?? ""}${event.value}`,
              };
            }
            return {
              status: event.status,
              value: event.value,
            };
        }
      },
      () => event.createdAt,
    );
  }
}
