import { BaseApi } from "@/api/base.api";

import { CloudAgentApi } from "./cloud-agent.api";

export * from "./cloud-agent.api";
export * from "./cloud-execution.api";

export class IntegrailCloudApi extends BaseApi {
  public readonly agent: CloudAgentApi = new CloudAgentApi(this.options);
}
