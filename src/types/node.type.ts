import { z } from "@/prelude/zod";

export const NodeInputSchema = z.object({ name: z.string().min(1), value: z.any() });
export type NodeInput = z.infer<typeof NodeInputSchema>;

export const NodeIdSchema = z.string().min(1).openapi({ example: "1" });
export type NodeId = z.infer<typeof NodeIdSchema>;

export const NodeSchema = z.object({
  id: NodeIdSchema,
  name: z.string().min(1),
  inputs: z.array(NodeInputSchema).optional(),
  fallbackOutputs: z.array(z.object({ name: z.string().min(1), value: z.any() })).optional(),
  call: z
    .object({
      ref: z.string().min(1).openapi({ example: "{{1.output}}" }),
      description: z.string(),
    })
    .optional(),

  /** @deprecated use call instead */
  callDescription: z.string().optional(),
  /** @deprecated use call instead */
  inputsRef: z.string().optional(),
});
export type Node = z.infer<typeof NodeSchema>;

export const NodeSelectorSchema = z.object({
  nodeId: NodeIdSchema,
});
