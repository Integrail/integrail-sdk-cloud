# Integrail SDK

## Usage

Below is an example of how to initialize the `IntegrailCloudApi` and use streaming versions of its `agent.execute` and `agent.executeMultipart` methods.

### Initializing IntegrailCloudApi

```typescript
import { IntegrailCloudApi } from "integrail-sdk-cloud";

const cloudApi = new IntegrailCloudApi({
  apiToken: "...",
});
```

### Using `agent.execute`

```typescript
const agentId = "...";
const accountId = "...";

const onEvent = (event: ExecutionEvent, execution: AgentExecution | null) => {
  console.log(event);
};

const onFinish = (execution: AgentExecution | null) => {
  console.log(execution);
};

cloudApi.agent.execute(
  agentId,
  accountId,
  { inputs: { param1: "value1" }, stream: true },
  onEvent,
  onFinish,
);
```

### Using `agent.executeMultipart`

```typescript
const agentId = "...";
const accountId = "...";

const onEvent = (event: ExecutionEvent, execution: AgentExecution | null) => {
  console.log(event);
};

const onFinish = (execution: AgentExecution | null) => {
  console.log(execution);
};

const blob = await fetch("...").then(async (r) => await r.blob());

cloudApi.agent.executeMultipart(
  agentId,
  accountId,
  { inputs: { param1: "value1" }, stream: true },
  { param2: blob },
  onEvent,
  onFinish,
);
```

## License

This project is licensed under the MIT License. See the `LICENSE.txt` file for more details.
