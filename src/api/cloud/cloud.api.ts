import { BaseApi } from "@/api/base.api";

import { CloudAgentApi } from "./cloud-agent.api";
import { CloudMemoryApi } from "./cloud-memory.api";

export * from "./cloud-agent.api";
export * from "./cloud-execution.api";
export * from "./cloud-memory.api";

export class IntegrailCloudApi extends BaseApi {
  public readonly agent: CloudAgentApi = new CloudAgentApi(this.options);
  public readonly memory: CloudMemoryApi = new CloudMemoryApi(this.options);
}
