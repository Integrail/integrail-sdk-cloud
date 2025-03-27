import { z } from "@/prelude/zod";

export const NodeInputSchema = z.object({
  name: z.string().min(1),
  value: z.any(),
  literal: z.boolean().nullish(),
});
export type NodeInput = z.infer<typeof NodeInputSchema>;

export const NodeIdSchema = z.string().min(1).openapi({ example: "1" });
export type NodeId = z.infer<typeof NodeIdSchema>;

export const NodeSchema = z.object({
  id: NodeIdSchema,
  name: z.string().min(1),
  inputs: z.array(NodeInputSchema).nullish(),
  fallbackOutputs: z.array(z.object({ name: z.string().min(1), value: z.any() })).nullish(),
  call: z
    .object({
      ref: z.string().min(1).openapi({ example: "{{1.output}}" }),
      description: z.string(),
    })
    .nullish(),
  maxRetries: z.number().int().nonnegative().nullish(),
  retryDelayMs: z.number().int().min(100).max(30000).nullish(),
  errorMessage: z.string().nullish(),
  failAgentIfFails: z.boolean().nullish(),

  /** @deprecated use call instead */
  callDescription: z.string().nullish(),
  /** @deprecated use call instead */
  inputsRef: z.string().nullish(),
});
export type Node = z.infer<typeof NodeSchema>;

export const NodeSelectorSchema = z.object({
  nodeId: NodeIdSchema,
});
