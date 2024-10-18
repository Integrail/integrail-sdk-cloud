// eslint-disable-next-line import/order
import fetchMock from "jest-fetch-mock";

import {
  CloudAgentApi,
  CloudAgentExecuteNonStreamingRequest,
  CloudAgentExecuteStreamingRequest,
} from "@/api/cloud/cloud-agent.api";
import { AgentExecuteNonStreamingResponse } from "@/api/common/agent.api";
import { MockReadableStream } from "@/api/cloud/mocks/readable-stream.mock";
import { ExecutionEvent, ExecutionEventOp } from "@/types/execution.type";
import { AgentId } from "@/types/agent.type";
import { AccountId } from "@/types/account.type";
import "@/polyfills/AbortController";

describe("CloudAgentApi", () => {
  let api: CloudAgentApi;
  const executionId = "exec1";

  const events: ExecutionEvent[] = [
    {
      executionId,
      op: ExecutionEventOp.INIT,
      execution: { id: executionId },
      createdAt: new Date(),
    },
  ];

  beforeEach(() => {
    api = new CloudAgentApi({
      baseUri: "http://localhost",
      apiToken: "token",
    });
    fetchMock.enableMocks();
    fetchMock.dontMock();
  });

  afterEach(() => {
    fetchMock.disableMocks();
  });

  test("should execute non-streaming request", async () => {
    const agentId: AgentId = "agent1";
    const accountId: AccountId = "account1";
    const payload: CloudAgentExecuteNonStreamingRequest = {
      stream: false,
      inputs: [],
    };
    const response: AgentExecuteNonStreamingResponse = {
      status: "ok",
      executionId: executionId,
    };
    fetchMock.mockIf(new RegExp(`api/${accountId}/agent/${agentId}/execute`), async () =>
      JSON.stringify(response),
    );

    const result = await api.execute(agentId, accountId, payload);
    expect(result).toEqual(response);
  });

  test("should execute streaming request", async () => {
    const agentId: AgentId = "agent1";
    const accountId: AccountId = "account1";
    const payload: CloudAgentExecuteStreamingRequest = {
      stream: true,
      inputs: [],
    };
    const onEvent = jest.fn();
    const mockStream = new MockReadableStream([Buffer.from(JSON.stringify(events[0]))]);
    fetchMock.mockIf(new RegExp(`api/${accountId}/agent/${agentId}/execute`), async () => ({
      body: mockStream as any,
    }));

    return new Promise((resolve) => {
      api
        .execute(agentId, accountId, payload, onEvent)
        .then((abortController) => {
          expect(abortController).toBeInstanceOf(AbortController);
          expect(abortController.signal.aborted).toBe(false);
        })
        .catch((error) => {
          console.error(error);
        });

      setTimeout(() => {
        expect(onEvent).toHaveBeenCalledTimes(1);
        resolve(null);
      }, 100);
    });
  });

  test("should cancel execution", async () => {
    const agentId: AgentId = "agent1";
    const accountId: AccountId = "account1";
    const payload: CloudAgentExecuteStreamingRequest = {
      stream: true,
      inputs: {},
    };
    const onEvent = jest.fn();
    const mockStream = new MockReadableStream([Buffer.from(JSON.stringify(events[0]))]);

    fetchMock.mockIf(new RegExp(`api/${accountId}/agent/${agentId}/execute`), async () => ({
      body: mockStream as any,
    }));

    return new Promise((resolve) => {
      api
        .execute(agentId, accountId, payload, onEvent)
        .then((abortController) => {
          expect(abortController).toBeInstanceOf(AbortController);
          abortController.abort();
          expect(abortController.signal.aborted).toBe(true);
        })
        .catch((error) => {
          console.error(error);
        });

      setTimeout(() => {
        expect(onEvent).toHaveBeenCalledTimes(0);
        resolve(null);
      }, 100);
    });
  });
});
