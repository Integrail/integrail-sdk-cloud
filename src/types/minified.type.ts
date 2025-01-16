import { z } from "@/prelude/zod";

import {
  AgentExecutionStatus,
  BaseEventSchema,
  ExecutionEvent,
  ExecutionEventOp,
  ExecutionIdSchema,
} from "./execution.type";
import { ExecutionStatsSchema } from "./stats.type";
import { NodeExecutionStatus, OutputStateStatus } from "./node-execution.type";

export enum MiniExecutionEventOp {
  // Agent level.
  INIT = 0x10,
  UPDATE_STATUS = 0x11,

  // Agent output level.
  OUTPUT_UPDATE = 0x20,

  // Node level.
  NODE_UPDATE_STATUS = 0x30,

  // Node output level.
  NODE_OUTPUT_UPDATE_STATUS = 0x40,
  NODE_OUTPUT_UPDATE = 0x41,

  // Misc.
  PING = 0xf0,
  LOG = 0xf1,
}

export enum MiniAgentExecutionStatus {
  PENDING = 0x10,
  RUNNING = 0x20,
  CANCELLING = 0x30,
  CANCELLED = 0x40,
  FINISHED = 0x50,
  ERROR = 0x60,
}

export enum MiniNodeExecutionStatus {
  // Waiting.
  PENDING = 0x10,
  RETRY = 0x11,

  // Starting.
  STARTING = 0x20,

  // Started.
  RUNNING = 0x30,

  // Ended.
  FINISHED = 0x40,
  CANCELLED = 0x41,
  ERROR = 0x42,
}

export enum MiniOutputStateStatus {
  PENDING = 0x10,
  RUNNING = 0x20,
  FINISHED = 0x30,
  CANCELLED = 0x40,
}

export enum MiniLogLevel {
  DEBUG = 0x10,
  INFO = 0x20,
  WARN = 0x30,
  ERROR = 0x40,
}

export enum MiniLogStatusTextAction {
  SET = 0x10,
  CLEAR = 0x20,
}

export const MiniBooleanSchema = z.boolean().or(z.literal(1)).or(z.literal(0));
export type MiniBoolean = z.infer<typeof MiniBooleanSchema>;

export namespace MiniBoolean {
  export function fromBoolean(bool: boolean): MiniBoolean {
    return bool ? 1 : 0;
  }

  export function toBoolean(miniBool): boolean {
    return miniBool === true || miniBool === 1;
  }
}

export const MiniBaseEventSchema = z.tuple([
  /* executionId: */ ExecutionIdSchema,
  /* createdAt: */ z.coerce.date(),
]);

const MiniInitEventSchema = z.tuple([
  ...MiniBaseEventSchema.items,
  /* op: */ z.literal(MiniExecutionEventOp.INIT),
  /* execution: */ z.any(),
]);

const MiniUpdateStatusEventSchema = z.tuple([
  ...MiniBaseEventSchema.items,
  /* op: */ z.literal(MiniExecutionEventOp.UPDATE_STATUS),
  /* status: */ z.nativeEnum(MiniAgentExecutionStatus),
  /* message: */ z.string().nullish(),
  /* _errors: */ z.array(z.any()).nullish(),
]);
type MiniUpdateStatusEvent = z.infer<typeof MiniUpdateStatusEventSchema>;

const MiniOutputUpdateEventSchema = z.tuple([
  ...MiniBaseEventSchema.items,
  /* op: */ z.literal(MiniExecutionEventOp.OUTPUT_UPDATE),
  /* output: */ z.string().min(1),
  /* value: */ z.any(),
  /* append: */ MiniBooleanSchema.nullish(),
]);
type MiniOutputUpdateEvent = z.infer<typeof MiniOutputUpdateEventSchema>;

const MiniNodeUpdateStatusEventSchema = z.tuple([
  ...MiniBaseEventSchema.items,
  /* op: */ z.literal(MiniExecutionEventOp.NODE_UPDATE_STATUS),
  /* nodeId: */ z.string().min(1),
  /* status: */ z.nativeEnum(MiniNodeExecutionStatus),
  /* message: */ z.string().nullish(),
  /* errors: */ z.array(z.any()).nullish(),
  /* stats: */ ExecutionStatsSchema.nullish(),
  /* retries: */ z.number().int().nonnegative().nullish(),
]);
type MiniNodeUpdateStatusEvent = z.infer<typeof MiniNodeUpdateStatusEventSchema>;

const MiniNodeOutputUpdateStatusEventSchema = z.tuple([
  ...MiniBaseEventSchema.items,
  /* op: */ z.literal(MiniExecutionEventOp.NODE_OUTPUT_UPDATE_STATUS),
  /* nodeId: */ z.string().min(1),
  /* output: */ z.string().min(1),
  /* status: */ z.nativeEnum(MiniOutputStateStatus),
]);
type MiniNodeOutputUpdateStatusEvent = z.infer<typeof MiniNodeOutputUpdateEventSchema>;

const MiniNodeOutputUpdateEventSchema = z.tuple([
  ...MiniBaseEventSchema.items,
  /* op: */ z.literal(MiniExecutionEventOp.NODE_OUTPUT_UPDATE),
  /* nodeId: */ z.string().min(1),
  /* output: */ z.string().min(1),
  /* status: */ z.nativeEnum(MiniOutputStateStatus),
  /* value: */ z.any(),
  /* append: */ MiniBooleanSchema.nullish(),
]);
type MiniNodeOutputUpdateEvent = z.infer<typeof MiniNodeOutputUpdateEventSchema>;

const MiniPingEventSchema = z.tuple([
  ...MiniBaseEventSchema.items,
  /* op: */ z.literal(MiniExecutionEventOp.PING),
]);

const MiniLogEventSchema = z.tuple([
  ...MiniBaseEventSchema.items,
  /* op: */ z.literal(MiniExecutionEventOp.LOG),
  /* level: */ z.nativeEnum(MiniLogLevel),
  /* statusText: */ z.nativeEnum(MiniLogStatusTextAction).nullish(),
  /* nodeId: */ z.string().nullish(),
  /* output: */ z.string().nullish(),
  /* message: */ z.string(),
  /* data: */ z.any().nullish(),
]);
type MiniLogEvent = z.infer<typeof MiniLogEventSchema>;

export const MiniExecutionEventSchema = z.union([
  // Agent level.
  MiniInitEventSchema,
  MiniUpdateStatusEventSchema,

  // Agent output level.
  MiniOutputUpdateEventSchema,

  // Node level.
  MiniNodeUpdateStatusEventSchema,

  // Node output level.
  MiniNodeOutputUpdateEventSchema,
  MiniNodeOutputUpdateStatusEventSchema,

  MiniPingEventSchema,
  MiniLogEventSchema,
]);
export type MiniExecutionEvent = z.infer<typeof MiniExecutionEventSchema>;

export namespace MiniExecutionEvent {
  export function parse(value: unknown[]): MiniExecutionEvent {
    z.array(z.any()).min(3).parse(value);
    BaseEventSchema.parse(value.slice(0, 2));

    const op = z.nativeEnum(MiniExecutionEventOp).parse(value[3]);
    switch (op) {
      case MiniExecutionEventOp.INIT:
        return MiniInitEventSchema.parse(value);
      case MiniExecutionEventOp.UPDATE_STATUS:
        return MiniUpdateStatusEventSchema.parse(value);

      case MiniExecutionEventOp.OUTPUT_UPDATE:
        return MiniOutputUpdateEventSchema.parse(value);

      case MiniExecutionEventOp.NODE_UPDATE_STATUS:
        return MiniNodeUpdateStatusEventSchema.parse(value);

      case MiniExecutionEventOp.NODE_OUTPUT_UPDATE:
        return MiniNodeOutputUpdateEventSchema.parse(value);
      case MiniExecutionEventOp.NODE_OUTPUT_UPDATE_STATUS:
        return MiniNodeOutputUpdateStatusEventSchema.parse(value);

      case MiniExecutionEventOp.PING:
        return MiniPingEventSchema.parse(value);
      case MiniExecutionEventOp.LOG:
        return MiniLogEventSchema.parse(value);
    }
  }

  export function fromEventOp(op: ExecutionEventOp): MiniExecutionEventOp {
    switch (op) {
      case ExecutionEventOp.INIT:
        return MiniExecutionEventOp.INIT;
      case ExecutionEventOp.UPDATE_STATUS:
        return MiniExecutionEventOp.UPDATE_STATUS;

      case ExecutionEventOp.OUTPUT_UPDATE:
        return MiniExecutionEventOp.OUTPUT_UPDATE;

      case ExecutionEventOp.NODE_UPDATE_STATUS:
        return MiniExecutionEventOp.NODE_UPDATE_STATUS;

      case ExecutionEventOp.NODE_OUTPUT_UPDATE:
        return MiniExecutionEventOp.NODE_OUTPUT_UPDATE;
      case ExecutionEventOp.NODE_OUTPUT_UPDATE_STATUS:
        return MiniExecutionEventOp.NODE_OUTPUT_UPDATE_STATUS;

      case ExecutionEventOp.PING:
        return MiniExecutionEventOp.PING;
      case ExecutionEventOp.LOG:
        return MiniExecutionEventOp.LOG;
    }
  }
  export function toEventOp(miniOp: MiniExecutionEventOp): ExecutionEventOp {
    switch (miniOp) {
      case MiniExecutionEventOp.INIT:
        return ExecutionEventOp.INIT;
      case MiniExecutionEventOp.UPDATE_STATUS:
        return ExecutionEventOp.UPDATE_STATUS;

      case MiniExecutionEventOp.OUTPUT_UPDATE:
        return ExecutionEventOp.OUTPUT_UPDATE;

      case MiniExecutionEventOp.NODE_UPDATE_STATUS:
        return ExecutionEventOp.NODE_UPDATE_STATUS;

      case MiniExecutionEventOp.NODE_OUTPUT_UPDATE:
        return ExecutionEventOp.NODE_OUTPUT_UPDATE;
      case MiniExecutionEventOp.NODE_OUTPUT_UPDATE_STATUS:
        return ExecutionEventOp.NODE_OUTPUT_UPDATE_STATUS;

      case MiniExecutionEventOp.PING:
        return ExecutionEventOp.PING;
      case MiniExecutionEventOp.LOG:
        return ExecutionEventOp.LOG;
    }
  }

  export function fromAgentExecutionStatus(status: AgentExecutionStatus): MiniAgentExecutionStatus {
    switch (status) {
      case AgentExecutionStatus.RUNNING:
        return MiniAgentExecutionStatus.RUNNING;
      case AgentExecutionStatus.PENDING:
        return MiniAgentExecutionStatus.PENDING;
      case AgentExecutionStatus.FINISHED:
        return MiniAgentExecutionStatus.FINISHED;
      case AgentExecutionStatus.CANCELLED:
        return MiniAgentExecutionStatus.CANCELLED;
      case AgentExecutionStatus.CANCELLING:
        return MiniAgentExecutionStatus.CANCELLING;
      case AgentExecutionStatus.ERROR:
        return MiniAgentExecutionStatus.ERROR;
    }
  }
  export function toAgentExecutionStatus(
    miniStatus: MiniAgentExecutionStatus,
  ): AgentExecutionStatus {
    switch (miniStatus) {
      case MiniAgentExecutionStatus.RUNNING:
        return AgentExecutionStatus.RUNNING;
      case MiniAgentExecutionStatus.PENDING:
        return AgentExecutionStatus.PENDING;
      case MiniAgentExecutionStatus.FINISHED:
        return AgentExecutionStatus.FINISHED;
      case MiniAgentExecutionStatus.CANCELLED:
        return AgentExecutionStatus.CANCELLED;
      case MiniAgentExecutionStatus.CANCELLING:
        return AgentExecutionStatus.CANCELLING;
      case MiniAgentExecutionStatus.ERROR:
        return AgentExecutionStatus.ERROR;
    }
  }

  export function fromNodeExecutionStatus(status: NodeExecutionStatus): MiniNodeExecutionStatus {
    switch (status) {
      case NodeExecutionStatus.STARTING:
        return MiniNodeExecutionStatus.STARTING;
      case NodeExecutionStatus.RUNNING:
        return MiniNodeExecutionStatus.RUNNING;
      case NodeExecutionStatus.RETRY:
        return MiniNodeExecutionStatus.RETRY;
      case NodeExecutionStatus.PENDING:
        return MiniNodeExecutionStatus.PENDING;
      case NodeExecutionStatus.FINISHED:
        return MiniNodeExecutionStatus.FINISHED;
      case NodeExecutionStatus.ERROR:
        return MiniNodeExecutionStatus.ERROR;
      case NodeExecutionStatus.CANCELLED:
        return MiniNodeExecutionStatus.CANCELLED;
    }
  }
  export function toNodeExecutionStatus(miniStatus: MiniNodeExecutionStatus): NodeExecutionStatus {
    switch (miniStatus) {
      case MiniNodeExecutionStatus.STARTING:
        return NodeExecutionStatus.STARTING;
      case MiniNodeExecutionStatus.RUNNING:
        return NodeExecutionStatus.RUNNING;
      case MiniNodeExecutionStatus.RETRY:
        return NodeExecutionStatus.RETRY;
      case MiniNodeExecutionStatus.PENDING:
        return NodeExecutionStatus.PENDING;
      case MiniNodeExecutionStatus.FINISHED:
        return NodeExecutionStatus.FINISHED;
      case MiniNodeExecutionStatus.ERROR:
        return NodeExecutionStatus.ERROR;
      case MiniNodeExecutionStatus.CANCELLED:
        return NodeExecutionStatus.CANCELLED;
    }
  }

  export function fromOutputStateStatus(status: OutputStateStatus): MiniOutputStateStatus {
    switch (status) {
      case OutputStateStatus.RUNNING:
        return MiniOutputStateStatus.RUNNING;
      case OutputStateStatus.PENDING:
        return MiniOutputStateStatus.PENDING;
      case OutputStateStatus.FINISHED:
        return MiniOutputStateStatus.FINISHED;
      case OutputStateStatus.CANCELLED:
        return MiniOutputStateStatus.CANCELLED;
    }
  }
  export function toOutputStateStatus(miniStatus: MiniOutputStateStatus): OutputStateStatus {
    switch (miniStatus) {
      case MiniOutputStateStatus.RUNNING:
        return OutputStateStatus.RUNNING;
      case MiniOutputStateStatus.PENDING:
        return OutputStateStatus.PENDING;
      case MiniOutputStateStatus.FINISHED:
        return OutputStateStatus.FINISHED;
      case MiniOutputStateStatus.CANCELLED:
        return OutputStateStatus.CANCELLED;
    }
  }

  export function fromLogLevel(level: "error" | "warn" | "info" | "debug"): MiniLogLevel {
    switch (level) {
      case "error":
        return MiniLogLevel.ERROR;
      case "warn":
        return MiniLogLevel.WARN;
      case "info":
        return MiniLogLevel.INFO;
      case "debug":
        return MiniLogLevel.DEBUG;
    }
  }
  export function toLogLevel(miniLevel: MiniLogLevel): "error" | "warn" | "info" | "debug" {
    switch (miniLevel) {
      case MiniLogLevel.ERROR:
        return "error";
      case MiniLogLevel.WARN:
        return "warn";
      case MiniLogLevel.INFO:
        return "info";
      case MiniLogLevel.DEBUG:
        return "debug";
    }
  }

  export function fromLogStatusTextAction(
    action: "set" | "clear" | undefined | null,
  ): MiniLogStatusTextAction | undefined {
    if (action == null) return undefined;
    switch (action) {
      case "set":
        return MiniLogStatusTextAction.SET;
      case "clear":
        return MiniLogStatusTextAction.CLEAR;
    }
  }
  export function toLogStatusTextAction(
    miniAction: MiniLogStatusTextAction | undefined | null,
  ): "set" | "clear" | undefined {
    if (miniAction == null) return undefined;
    switch (miniAction) {
      case MiniLogStatusTextAction.SET:
        return "set";
      case MiniLogStatusTextAction.CLEAR:
        return "clear";
    }
  }

  export function fromEvent(event: ExecutionEvent): MiniExecutionEvent {
    switch (event.op) {
      case ExecutionEventOp.INIT:
        return [
          event.executionId,
          event.createdAt,
          fromEventOp(event.op) as MiniExecutionEventOp.INIT,
          event.execution,
        ];
      case ExecutionEventOp.UPDATE_STATUS:
        return [
          event.executionId,
          event.createdAt,
          fromEventOp(event.op) as MiniExecutionEventOp.UPDATE_STATUS,
          fromAgentExecutionStatus(event.status),
          event.message,
          event._errors,
        ];
      case ExecutionEventOp.OUTPUT_UPDATE:
        return [
          event.executionId,
          event.createdAt,
          fromEventOp(event.op) as MiniExecutionEventOp.OUTPUT_UPDATE,
          event.output,
          event.value,
          event.append == null ? undefined : MiniBoolean.fromBoolean(event.append),
        ];
      case ExecutionEventOp.NODE_UPDATE_STATUS:
        return [
          event.executionId,
          event.createdAt,
          fromEventOp(event.op) as MiniExecutionEventOp.NODE_UPDATE_STATUS,
          event.nodeId,
          fromNodeExecutionStatus(event.status),
          event.message,
          event.errors,
          event.stats,
          event.retries,
        ];
      case ExecutionEventOp.NODE_OUTPUT_UPDATE_STATUS:
        return [
          event.executionId,
          event.createdAt,
          fromEventOp(event.op) as MiniExecutionEventOp.NODE_OUTPUT_UPDATE_STATUS,
          event.nodeId,
          event.output,
          fromOutputStateStatus(event.status),
        ];
      case ExecutionEventOp.NODE_OUTPUT_UPDATE:
        return [
          event.executionId,
          event.createdAt,
          fromEventOp(event.op) as MiniExecutionEventOp.NODE_OUTPUT_UPDATE,
          event.nodeId,
          event.output,
          fromOutputStateStatus(event.status),
          event.value,
          event.append == null ? undefined : MiniBoolean.fromBoolean(event.append),
        ];
      case ExecutionEventOp.PING:
        return [
          event.executionId,
          event.createdAt,
          fromEventOp(event.op) as MiniExecutionEventOp.PING,
        ];
      case ExecutionEventOp.LOG:
        return [
          event.executionId,
          event.createdAt,
          fromEventOp(event.op) as MiniExecutionEventOp.LOG,
          fromLogLevel(event.level),
          fromLogStatusTextAction(event.statusText),
          event.nodeId,
          event.output,
          event.message,
          event.data,
        ];
    }
  }

  export function toEvent(miniEvent: MiniExecutionEvent): ExecutionEvent {
    switch (miniEvent[2]) {
      case MiniExecutionEventOp.INIT: {
        const e = MiniInitEventSchema.parse(miniEvent);
        return {
          executionId: e[0],
          createdAt: e[1],
          op: toEventOp(e[2]) as ExecutionEventOp.INIT,
          execution: e[3],
        };
      }
      case MiniExecutionEventOp.UPDATE_STATUS: {
        const e = MiniUpdateStatusEventSchema.parse(miniEvent);
        return {
          executionId: e[0],
          createdAt: e[1],
          op: toEventOp(e[2]) as ExecutionEventOp.UPDATE_STATUS,
          status: toAgentExecutionStatus(e[3]),
          message: e[4],
          _errors: e[5],
        };
      }
      case MiniExecutionEventOp.OUTPUT_UPDATE: {
        const e = MiniOutputUpdateEventSchema.parse(miniEvent);
        return {
          executionId: e[0],
          createdAt: e[1],
          op: toEventOp(e[2]) as ExecutionEventOp.OUTPUT_UPDATE,
          output: e[3],
          value: e[4],
          append: MiniBoolean.toBoolean(e[5]),
        };
      }
      case MiniExecutionEventOp.NODE_UPDATE_STATUS: {
        const e = MiniNodeUpdateStatusEventSchema.parse(miniEvent);
        return {
          executionId: e[0],
          createdAt: e[1],
          op: toEventOp(e[2]) as ExecutionEventOp.NODE_UPDATE_STATUS,
          nodeId: e[3],
          status: toNodeExecutionStatus(e[4]),
          message: e[5],
          errors: e[6],
          stats: e[7],
          retries: e[8],
        };
      }
      case MiniExecutionEventOp.NODE_OUTPUT_UPDATE_STATUS: {
        const e = MiniNodeOutputUpdateStatusEventSchema.parse(miniEvent);
        return {
          executionId: e[0],
          createdAt: e[1],
          op: toEventOp(e[2]) as ExecutionEventOp.NODE_OUTPUT_UPDATE_STATUS,
          nodeId: e[3],
          output: e[4],
          status: toOutputStateStatus(e[5]),
        };
      }
      case MiniExecutionEventOp.NODE_OUTPUT_UPDATE: {
        const e = MiniNodeOutputUpdateEventSchema.parse(miniEvent);
        return {
          executionId: e[0],
          createdAt: e[1],
          op: toEventOp(e[2]) as ExecutionEventOp.NODE_OUTPUT_UPDATE,
          nodeId: e[3],
          output: e[4],
          status: toOutputStateStatus(e[5]),
          value: e[6],
          append: e[7] == null ? undefined : MiniBoolean.toBoolean(e[7]),
        };
      }
      case MiniExecutionEventOp.PING: {
        const e = MiniPingEventSchema.parse(miniEvent);
        return {
          executionId: e[0],
          createdAt: e[1],
          op: toEventOp(e[2]) as ExecutionEventOp.PING,
        };
      }
      case MiniExecutionEventOp.LOG: {
        const e = MiniLogEventSchema.parse(miniEvent);
        return {
          executionId: e[0],
          createdAt: e[1],
          op: toEventOp(e[2]) as ExecutionEventOp.LOG,
          level: toLogLevel(e[3]),
          statusText: toLogStatusTextAction(e[4]),
          nodeId: e[5],
          output: e[6],
          message: e[7],
          data: e[8],
        };
      }
      default:
        throw new Error(`Unknown mini execution event operation: ${miniEvent[2]}`);
    }
  }
}
