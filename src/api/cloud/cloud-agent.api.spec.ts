// eslint-disable-next-line import/order
import fetchMock from "jest-fetch-mock";

jest.setMock("cross-fetch", {
  ...jest.requireActual("cross-fetch"),
  __esmodule: true,
  fetch: fetchMock,
  default: fetchMock,
});

import {
  CloudMultiAgentApi,
  CloudMultiAgentExecuteNonStreamingRequest,
  CloudMultiAgentExecuteStreamingRequest,
} from "@/api/cloud/cloud-agent.api";
import { AgentExecuteNonStreamingResponse } from "@/api/common/agent.api";
import MockReadableStream from "@/api/cloud/mocks/MockReadableStream";
import { ExecutionEvent, ExecutionEventOp } from "@/types/execution.type";
import { MultiAgentId } from "@/types/multi-agent.type";
import { AccountId } from "@/types/account.type";
import "@/polyfills/AbortController";

describe("CloudMultiAgentApi", () => {
  let api: CloudMultiAgentApi;
  const executionId = "exec1";

  const events: ExecutionEvent[] = [
    {
      op: ExecutionEventOp.INIT,
      execution: { id: executionId },
      createdAt: new Date(),
    },
  ];

  beforeEach(() => {
    api = new CloudMultiAgentApi({
      baseUri: "http://localhost",
      apiToken: "token",
    });
  });

  afterEach(() => {
    fetchMock.disableMocks();
  });

  test("should execute non-streaming request", async () => {
    const agentId: MultiAgentId = "agent1";
    const accountId: AccountId = "account1";
    const payload: CloudMultiAgentExecuteNonStreamingRequest = {
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
    const agentId: MultiAgentId = "agent1";
    const accountId: AccountId = "account1";
    const payload: CloudMultiAgentExecuteStreamingRequest = {
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
    const agentId: MultiAgentId = "agent1";
    const accountId: AccountId = "account1";
    const payload: CloudMultiAgentExecuteStreamingRequest = {
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
