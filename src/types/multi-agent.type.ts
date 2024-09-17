import { z } from "@/prelude/zod";

import { NodeSchema } from "./node.type";
import { TypeSchema } from "./data.type";
import { NodeExecutionStateSchema } from "./node-execution.type";
import { AccountIdSchema } from "./account.type";

export const MultiAgentIdSchema = z.string().min(1).openapi({ example: "d9e976b6e895" });
export type MultiAgentId = z.infer<typeof MultiAgentIdSchema>;

export const MultiAgentInputSchema = TypeSchema.and(
  z.object({
    name: z.string().min(1),
    saveHistory: z.boolean().optional(),
  }),
);
export type MultiAgentInput = z.infer<typeof MultiAgentInputSchema>;

export const MutliAgentOutputSchema = TypeSchema.and(
  z.object({
    name: z.string().min(1),
    value: z.string().min(1),
    saveHistory: z.boolean().optional(),
  }),
);
export type MultiAgentOutput = z.infer<typeof MutliAgentOutputSchema>;

export const InlineMultiAgentSchema = z.object({
  inputs: z.array(MultiAgentInputSchema),
  outputs: z.array(MutliAgentOutputSchema),
  nodes: z.array(NodeSchema),
  mock: z
    .record(NodeExecutionStateSchema.omit({ updatedAt: true, retries: true, inputs: true }))
    .optional(),
});
export type InlineMultiAgent = z.infer<typeof InlineMultiAgentSchema>;

export const AgentIntegrationTokenSchema = z.object({
  tokenId: z.string(),
});
export type AgentIntegrationToken = z.infer<typeof AgentIntegrationTokenSchema>;
export const AgentIntegrationsSchema = z.record(z.array(AgentIntegrationTokenSchema));
export type AgentIntegrations = z.infer<typeof AgentIntegrationsSchema>;

export const MultiAgentSchema = InlineMultiAgentSchema.extend({
  _id: MultiAgentIdSchema.optional(),
  version: z.string().or(z.number()).optional(),
  integrations: AgentIntegrationsSchema.optional(),
  accountId: AccountIdSchema.nullable().optional(),
});
export type MultiAgent = z.infer<typeof MultiAgentSchema>;

export const CloudMultiAgentSchema = MultiAgentSchema.extend({
  isActive: z.boolean(),
});
export type CloudMultiAgent = z.infer<typeof CloudMultiAgentSchema>;
