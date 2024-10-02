import { BaseApi } from "@/api/base.api";

import { CloudAgentApi, CloudCategoryApi } from "./cloud-agent.api";
import { CloudNodeApi } from "./cloud-node.api";
import { CloudMemoryApi } from "./cloud-memory.api";

export * from "./cloud-agent.api";
export * from "./cloud-execution.api";
export * from "./cloud-memory.api";

export class IntegrailCloudApi extends BaseApi {
  public readonly agent: CloudAgentApi = new CloudAgentApi(this.options);
  public readonly node: CloudNodeApi = new CloudNodeApi(this.options);
  public readonly category: CloudCategoryApi = new CloudCategoryApi(this.options);
  public readonly memory: CloudMemoryApi = new CloudMemoryApi(this.options);
}
