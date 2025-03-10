import { z } from "@/prelude/zod";

import { NodeSchema } from "./node.type";
import { TypeSchema } from "./data.type";
import { NodeExecutionStateSchema } from "./node-execution.type";
import { AccountIdSchema } from "./account.type";

export const AgentIdSchema = z.string().min(1).openapi({ example: "d9e976b6e895" });
export type AgentId = z.infer<typeof AgentIdSchema>;

export const AgentInputSchema = TypeSchema.and(
  z.object({
    name: z.string().min(1),
    saveHistory: z.boolean().nullish(),
  }),
);
export type AgentInput = z.infer<typeof AgentInputSchema>;

// export const AgentOutputSchema = TypeSchema.and(
//   z.object({
//     name: z.string().min(1),
//     value: z.any(),
//     saveHistory: z.boolean().nullish(),
//   }),
// );
export const AgentOutputSchema = z.object({
  name: z.string().min(1),
  value: z.any(),
  saveHistory: z.boolean().nullish(),
});
export type AgentOutput = z.infer<typeof AgentOutputSchema>;

export const InlineAgentSchema = z.object({
  inputs: z.array(AgentInputSchema),
  outputs: z.array(AgentOutputSchema),
  nodes: z.array(NodeSchema),
  mock: z
    .record(NodeExecutionStateSchema.omit({ updatedAt: true, retries: true, inputs: true }))
    .nullish(),
});
export type InlineAgent = z.infer<typeof InlineAgentSchema>;

export const AgentIntegrationTokenSchema = z.object({
  tokenId: z.string(),
});
export type AgentIntegrationToken = z.infer<typeof AgentIntegrationTokenSchema>;
export const AgentIntegrationsSchema = z.record(z.array(AgentIntegrationTokenSchema));
export type AgentIntegrations = z.infer<typeof AgentIntegrationsSchema>;

export const AgentSchema = InlineAgentSchema.extend({
  _id: AgentIdSchema.nullish(),
  version: z.string().or(z.number()).nullish(),
  integrations: AgentIntegrationsSchema.nullish(),
  accountId: AccountIdSchema.nullish(),
});
export type Agent = z.infer<typeof AgentSchema>;

export const CloudAgentSchema = AgentSchema.extend({
  isActive: z.boolean(),
});
export type CloudAgent = z.infer<typeof CloudAgentSchema>;
