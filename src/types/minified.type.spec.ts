import { AgentExecutionStatus, ExecutionEvent, ExecutionEventOp } from "./execution.type";
import { MiniExecutionEvent } from "./minified.type";
import { NodeExecutionStatus, OutputStateStatus } from "./node-execution.type";

const EXECUTION1_ID = "execution1";
const NODE1_ID = "node1";
const OUTPUT1_NAME = "output1";

let _now = new Date();
const now = (): Date => {
  _now = new Date(_now.getTime() + 1000);
  return _now;
};

const events: ExecutionEvent[] = [
  {
    executionId: EXECUTION1_ID,
    op: ExecutionEventOp.UPDATE_STATUS,
    status: AgentExecutionStatus.RUNNING,
    createdAt: now(),
  },
  {
    executionId: EXECUTION1_ID,
    op: ExecutionEventOp.NODE_OUTPUT_UPDATE_STATUS,
    nodeId: NODE1_ID,
    output: OUTPUT1_NAME,
    status: OutputStateStatus.RUNNING,
    createdAt: now(),
  },
  {
    executionId: EXECUTION1_ID,
    op: ExecutionEventOp.NODE_UPDATE_STATUS,
    nodeId: NODE1_ID,
    status: NodeExecutionStatus.RUNNING,
    retries: 1,
    createdAt: now(),
  },
  {
    executionId: EXECUTION1_ID,
    op: ExecutionEventOp.NODE_OUTPUT_UPDATE,
    nodeId: NODE1_ID,
    output: OUTPUT1_NAME,
    status: OutputStateStatus.RUNNING,
    value: "Lorem ipsum dolor sit amet, ",
    append: true,
    createdAt: now(),
  },
  {
    executionId: EXECUTION1_ID,
    op: ExecutionEventOp.NODE_OUTPUT_UPDATE,
    nodeId: NODE1_ID,
    output: OUTPUT1_NAME,
    status: OutputStateStatus.RUNNING,
    value: "consectetur adipiscing elit, ",
    append: true,
    createdAt: now(),
  },
  {
    executionId: EXECUTION1_ID,
    op: ExecutionEventOp.NODE_OUTPUT_UPDATE,
    nodeId: NODE1_ID,
    output: OUTPUT1_NAME,
    status: OutputStateStatus.RUNNING,
    value: "sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    append: true,
    createdAt: now(),
  },
  {
    executionId: EXECUTION1_ID,
    op: ExecutionEventOp.NODE_OUTPUT_UPDATE_STATUS,
    nodeId: NODE1_ID,
    output: OUTPUT1_NAME,
    status: OutputStateStatus.FINISHED,
    createdAt: now(),
  },
  {
    executionId: EXECUTION1_ID,
    op: ExecutionEventOp.NODE_UPDATE_STATUS,
    nodeId: NODE1_ID,
    status: NodeExecutionStatus.FINISHED,
    createdAt: now(),
    retries: 1,
  },
  {
    executionId: EXECUTION1_ID,
    op: ExecutionEventOp.UPDATE_STATUS,
    status: AgentExecutionStatus.FINISHED,
    createdAt: now(),
  },
];

describe("minified.type", () => {
  test.each(events.map((e) => [`${e.op} ${e.createdAt}`, e]))("%s", async (_, event) => {
    expect(event).toEqual(MiniExecutionEvent.toEvent(MiniExecutionEvent.fromEvent(event)));
  });
});
