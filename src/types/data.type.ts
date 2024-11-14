import { z } from "@/prelude/zod";

import { ContentCategory, ContentTypeEnum } from "./content.type";

export enum TypeName {
  // Primitives.
  BOOLEAN = "boolean",
  NUMBER = "number",
  INTEGER = "integer",
  STRING = "string",
  ENUM = "enum",
  VECTOR = "vector",

  // Complex types.
  SIGNAL = "signal",
  OBJECT = "object",
  LIST = "list",
  DICT = "dict",
  ONE_OF = "oneOf",
  ANY = "any",

  // Media.
  IMAGE = "image",
  AUDIO = "audio",
  VIDEO = "video",
  THREE_DIMENSIONAL = "threeDimensional",
  FILE = "file",

  // References.
  NODE_CALL = "nodeCall",
  CALL = "call",

  // External services.
  AUTH_TOKEN = "authToken",
}

export enum ExternalService {
  GOOGLE = "google",
  NYLAS = "nylas",
  WIX = "wix",
  CLICKUP = "clickup",
  TELEGRAM = "telegram",

  OPENAI = "openai",
  OLLAMA = "ollama",
  ANTHROPIC = "anthropic",
  ANYSCALE = "anyscale",
  FIREWORKS = "fireworks",
  GOOGLE_VERTEX = "google_vertex",
  STABILITY = "stability",
  AIMLAPI = "aimlapi",
  BFL = "bfl",
  ELEVENLABS = "elevenlabs",
}

export const InputRefSchema = z.object({ ref: z.string().min(1) });
export type InputRef = z.infer<typeof InputRefSchema>;

export const TypePrimitiveSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal(TypeName.BOOLEAN) }),
  z.object({
    type: z.literal(TypeName.NUMBER),
    min: z.number().nullish(),
    max: z.number().nullish(),
  }),
  z.object({
    type: z.literal(TypeName.INTEGER),
    min: z.number().int().nullish(),
    max: z.number().int().nullish(),
  }),
  z.object({
    type: z.literal(TypeName.STRING),
    min: z.number().int().nullish(),
    max: z.number().int().nullish(),
    truncate: z.boolean().nullish(),
  }),
  z.object({ type: z.literal(TypeName.ENUM), variants: z.array(z.string()).optional() }),
  z.object({ type: z.literal(TypeName.VECTOR), size: z.number().int().min(1) }),
]);
export type TypePrimitive = z.infer<typeof TypePrimitiveSchema>;

export const TypeComplexSchema: z.ZodType<TypeComplex> = z.discriminatedUnion("type", [
  z.object({
    type: z.literal(TypeName.SIGNAL),
    elements: z.lazy(() => TypeSchema),
  }),
  z.object({
    type: z.literal(TypeName.OBJECT),
    properties: z.record(
      z.string(),
      z.lazy(() => TypeSchema),
    ),
  }),
  z.object({
    type: z.literal(TypeName.LIST),
    elements: z.lazy(() => TypeSchema),
    size: z.union([z.number().int(), InputRefSchema]).nullish(),
    defaultLimit: z.number().int().nonnegative().nullish(),
    min: z.number().int().nonnegative().nullish(),
    max: z.number().int().nonnegative().nullish(),
  }),
  z.object({ type: z.literal(TypeName.DICT), elements: z.lazy(() => TypeSchema) }),
  z.object({
    type: z.literal(TypeName.ONE_OF),
    variants: z.array(z.lazy(() => TypeSchema)),
  }),
  z.object({ type: z.literal(TypeName.ANY) }),
]);
export type TypeComplex =
  | { type: TypeName.SIGNAL; elements: Type }
  | { type: TypeName.OBJECT; properties: Record<string, Type> }
  | {
      type: TypeName.LIST;
      elements: Type;
      size?: number | InputRef | null;
      min?: number | null;
      max?: number | null;
      defaultLimit?: number | null;
    }
  | { type: TypeName.DICT; elements: Type }
  | { type: TypeName.ONE_OF; variants: Type[] }
  | { type: TypeName.ANY };

export const TypeMediaSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal(TypeName.IMAGE) }),
  z.object({
    type: z.literal(TypeName.AUDIO),
    formats: z
      .array(z.string())
      .optional()
      .describe(
        Object.values(ContentTypeEnum)
          .filter((ct) => ct.category === ContentCategory.AUDIO)
          .map((ct) => ct.name)
          .join(", "),
      ),
  }),
  z.object({ type: z.literal(TypeName.VIDEO) }),
  z.object({ type: z.literal(TypeName.THREE_DIMENSIONAL) }),
  z.object({ type: z.literal(TypeName.FILE) }),
]);
export type TypeMedia = z.infer<typeof TypeMediaSchema>;

export const TypeRefSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal(TypeName.CALL) }),
  z.object({ type: z.literal(TypeName.NODE_CALL) }),
]);
export type TypeRef = z.infer<typeof TypeRefSchema>;

export const TypeExternalSchema = z.object({
  type: z.literal(TypeName.AUTH_TOKEN),
  service: z.nativeEnum(ExternalService),
});

export const TypeSchema = z
  .union([
    TypePrimitiveSchema,
    TypeComplexSchema,
    TypeMediaSchema,
    TypeRefSchema,
    TypeExternalSchema,
  ])
  .and(z.object({ optional: z.boolean().nullish() }));
export type Type = z.infer<typeof TypeSchema>;

export namespace Type {
  export function toJSONSchema(t: Type): Record<string, any> {
    switch (t.type) {
      case TypeName.BOOLEAN:
        return { type: "boolean" };
      case TypeName.NUMBER:
        return { type: "number", minimum: t.min, maximum: t.max };
      case TypeName.INTEGER:
        return { type: "integer", minimum: t.min, maximum: t.max };
      case TypeName.STRING:
        return { type: "string", minLength: t.min, maxLength: t.max };
      case TypeName.ENUM:
        return { type: "string", enum: t.variants };
      case TypeName.VECTOR:
        return { type: "array", items: { type: "number" }, minItems: t.size, maxItems: t.size };
      case TypeName.SIGNAL:
        return toJSONSchema(t.elements);
      case TypeName.OBJECT:
        return {
          type: "object",
          properties: Object.fromEntries(
            Object.entries(t.properties).map(([name, type]) => [name, toJSONSchema(type)]),
          ),
        };
      case TypeName.LIST:
        return {
          type: "array",
          items: toJSONSchema(t.elements),
          minItems: t.min,
          maxItems: t.max,
        };
      case TypeName.DICT:
        return {
          type: "object",
          additionalProperties: toJSONSchema(t.elements),
        };
      case TypeName.ONE_OF:
        return { oneOf: t.variants.map(toJSONSchema) };
      case TypeName.ANY:
        return {};
      case TypeName.IMAGE:
        return {
          oneOf: [
            { type: "object", properties: { url: { type: "string" } } },
            { type: "object", properties: { base64: { type: "string" } } },
          ],
        };
      case TypeName.AUDIO:
        return { type: "object", properties: { url: { type: "string" } } };
      case TypeName.VIDEO:
        return { type: "object", properties: { url: { type: "string" } } };
      case TypeName.THREE_DIMENSIONAL:
        return { type: "object", properties: { url: { type: "string" } } };
      case TypeName.FILE:
        return {
          type: "object",
          properties: { url: { type: "string" }, fileName: { type: "string" } },
        };
      case TypeName.NODE_CALL:
        return {
          type: "object",
          properties: { nodeId: { type: "string" }, inputs: { type: "object" } },
        };
      case TypeName.CALL:
        return {
          type: "object",
          properties: { inputs: { type: "object" } },
        };
      case TypeName.AUTH_TOKEN:
        return { type: "object" };
    }
  }
}
