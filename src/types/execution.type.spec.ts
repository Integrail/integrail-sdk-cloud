import {
  AgentExecution,
  AgentExecutionSchema,
  AgentExecutionStatus,
  ExecutionEventOp,
} from "./execution.type";
import { NodeExecutionStatus, OutputStateStatus } from "./node-execution.type";

const EXECUTION1_ID = "execution1";
const AGENT1_ID = "agent1";
const NODE1_ID = "node1";
const NODE2_ID = "node2";
const OUTPUT1_NAME = "output1";

describe("execution.type", () => {
  describe("AgentExecution.applyEvents", () => {
    it("should apply events to the agent execution", () => {
      let _now = new Date();
      const now = (): Date => {
        _now = new Date(_now.getTime() + 1000);
        return _now;
      };

      let execution: AgentExecution = {
        _id: EXECUTION1_ID,
        status: AgentExecutionStatus.PENDING,
        pipeline: {
          _id: AGENT1_ID,
          inputs: [],
          outputs: [],
          nodes: [],
        },
        inputs: {},
        outputs: {},
        state: {},
        events: [
          {
            op: ExecutionEventOp.UPDATE_STATUS,
            status: AgentExecutionStatus.RUNNING,
            createdAt: now(),
          },
          {
            op: ExecutionEventOp.NODE_OUTPUT_UPDATE_STATUS,
            nodeId: NODE1_ID,
            output: OUTPUT1_NAME,
            status: OutputStateStatus.RUNNING,
            createdAt: now(),
          },
          {
            op: ExecutionEventOp.NODE_UPDATE_STATUS,
            nodeId: NODE1_ID,
            status: NodeExecutionStatus.RUNNING,
            retries: 1,
            createdAt: now(),
          },
          {
            op: ExecutionEventOp.NODE_OUTPUT_UPDATE,
            nodeId: NODE1_ID,
            output: OUTPUT1_NAME,
            status: OutputStateStatus.RUNNING,
            value: "Lorem ipsum dolor sit amet, ",
            append: true,
            createdAt: now(),
          },
          {
            op: ExecutionEventOp.NODE_OUTPUT_UPDATE,
            nodeId: NODE1_ID,
            output: OUTPUT1_NAME,
            status: OutputStateStatus.RUNNING,
            value: "consectetur adipiscing elit, ",
            append: true,
            createdAt: now(),
          },
          {
            op: ExecutionEventOp.NODE_OUTPUT_UPDATE,
            nodeId: NODE1_ID,
            output: OUTPUT1_NAME,
            status: OutputStateStatus.RUNNING,
            value: "sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            append: true,
            createdAt: now(),
          },
          {
            op: ExecutionEventOp.NODE_OUTPUT_UPDATE_STATUS,
            nodeId: NODE1_ID,
            output: OUTPUT1_NAME,
            status: OutputStateStatus.FINISHED,
            createdAt: now(),
          },
          {
            op: ExecutionEventOp.NODE_UPDATE_STATUS,
            nodeId: NODE1_ID,
            status: NodeExecutionStatus.FINISHED,
            createdAt: now(),
            retries: 1,
          },
          {
            op: ExecutionEventOp.UPDATE_STATUS,
            status: AgentExecutionStatus.FINISHED,
            createdAt: now(),
          },
        ],
        updatedAt: now(),
      };
      execution = AgentExecutionSchema.parse(execution);
      execution = AgentExecution.applyEvents(execution);

      expect(execution.events).toHaveLength(0);
      expect(execution.status).toBe(AgentExecutionStatus.FINISHED);
      expect(execution.state[NODE1_ID].status).toBe(NodeExecutionStatus.FINISHED);
      expect(execution.state[NODE1_ID].outputs![OUTPUT1_NAME]?.status).toBe(
        OutputStateStatus.FINISHED,
      );
      const outputValue = execution.state[NODE1_ID].outputs![OUTPUT1_NAME]?.value;
      expect(outputValue).toBe(
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      );
    });

    it("should calculate execution stats", () => {
      let _now = new Date();
      const now = (): Date => {
        _now = new Date(_now.getTime() + 1000);
        return _now;
      };

      let execution: AgentExecution = {
        _id: EXECUTION1_ID,
        status: AgentExecutionStatus.PENDING,
        pipeline: {
          _id: AGENT1_ID,
          inputs: [],
          outputs: [],
          nodes: [],
        },
        inputs: {},
        outputs: {},
        state: {},
        events: [
          {
            op: ExecutionEventOp.UPDATE_STATUS,
            status: AgentExecutionStatus.RUNNING,
            createdAt: now(),
          },
          {
            op: ExecutionEventOp.NODE_UPDATE_STATUS,
            nodeId: NODE1_ID,
            status: NodeExecutionStatus.RUNNING,
            stats: { cost: 1 },
            createdAt: now(),
          },
          {
            op: ExecutionEventOp.NODE_UPDATE_STATUS,
            nodeId: NODE1_ID,
            status: NodeExecutionStatus.FINISHED,
            stats: { cost: 2, inputTokens: 3 },
            createdAt: now(),
          },
          {
            op: ExecutionEventOp.NODE_UPDATE_STATUS,
            nodeId: NODE2_ID,
            status: NodeExecutionStatus.RUNNING,
            stats: { cost: 4 },
            createdAt: now(),
          },
          {
            op: ExecutionEventOp.NODE_UPDATE_STATUS,
            nodeId: NODE2_ID,
            status: NodeExecutionStatus.FINISHED,
            stats: { cost: 5, outputTokens: 6 },
            createdAt: now(),
          },
          {
            op: ExecutionEventOp.UPDATE_STATUS,
            status: AgentExecutionStatus.FINISHED,
            createdAt: now(),
          },
          {
            op: ExecutionEventOp.UPDATE_STATUS,
            status: AgentExecutionStatus.FINISHED,
            createdAt: now(),
          },
        ],
        updatedAt: now(),
      };
      execution = AgentExecutionSchema.parse(execution);
      execution = AgentExecution.applyEvents(execution);

      expect(execution.events).toHaveLength(0);
      expect(execution.stats).toBeDefined();
      expect(execution.stats?.cost).toBe(7);
      expect(execution.stats?.inputTokens).toBe(3);
      expect(execution.stats?.outputTokens).toBe(6);
    });
  });
});
