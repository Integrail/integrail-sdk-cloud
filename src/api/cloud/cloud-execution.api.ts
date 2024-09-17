import { z } from "@/prelude/zod";
import { AgentExecutionSchema } from "@/types";
import { BaseResponseSchema } from "@/api/base.api";

export const ExecutionStatusResponseSchema = BaseResponseSchema.extend({
  execution: AgentExecutionSchema,
});
export type ExecutionStatusResponse = z.infer<typeof ExecutionStatusResponseSchema>;
