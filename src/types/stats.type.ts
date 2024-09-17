import { z } from "@/prelude/zod";

export const ExecutionStatsSchema = z.object({
  cost: z
    .number()
    .nonnegative()
    .optional()
    .openapi({ example: 0.0024, description: "Cost in USD" }),
  inputTokens: z.number().nonnegative().optional().openapi({ example: 8 }),
  outputTokens: z.number().nonnegative().optional().openapi({ example: 14 }),
});
export type ExecutionStats = z.infer<typeof ExecutionStatsSchema>;

export const AgentExecutionStatsSchema = ExecutionStatsSchema.extend({
  count: z.number().int().nonnegative().optional().openapi({ example: 3 }),
});

export const AggregatedExecutionStatsSchema = z.object({
  byAgent: z.record(AgentExecutionStatsSchema),
  total: ExecutionStatsSchema,
});
export type AggregatedExecutionStats = z.infer<typeof AggregatedExecutionStatsSchema>;
