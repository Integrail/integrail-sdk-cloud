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
  DATE = "date",
  DATETIME = "datetime",

  // Complex types.
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
  SALESFORCE = "salesforce",
  MICROSOFT = "microsoft",

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
  X_AI = "x_ai",
  TWILIO = "twilio",
}

export const InputRefSchema = z.object({ ref: z.string().min(1) });
export type InputRef = z.infer<typeof InputRefSchema>;

export const TypeBooleanSchema = z.object({ type: z.literal(TypeName.BOOLEAN) });
export type TypeBoolean = z.infer<typeof TypeBooleanSchema>;

export const TypeNumberSchema = z.object({
  type: z.literal(TypeName.NUMBER),
  min: z.number().nullish(),
  max: z.number().nullish(),
});
export type TypeNumber = z.infer<typeof TypeNumberSchema>;

export const TypeIntegerSchema = z.object({
  type: z.literal(TypeName.INTEGER),
  min: z.number().int().nullish(),
  max: z.number().int().nullish(),
});
export type TypeInteger = z.infer<typeof TypeIntegerSchema>;

export const TypeStringSchema = z.object({
  type: z.literal(TypeName.STRING),
  min: z.number().int().nullish(),
  max: z.number().int().nullish(),
  truncate: z.boolean().nullish(),
});
export type TypeString = z.infer<typeof TypeStringSchema>;

export const TypeEnumSchema = z.object({
  type: z.literal(TypeName.ENUM),
  variants: z.array(z.string()).optional(),
});
export type TypeEnum = z.infer<typeof TypeEnumSchema>;

export const TypeVectorSchema = z.object({
  type: z.literal(TypeName.VECTOR),
  size: z.number().int().min(1),
});
export type TypeVector = z.infer<typeof TypeVectorSchema>;

export const TypeDateSchema = z.object({ type: z.literal(TypeName.DATE) });
export type TypeDate = z.infer<typeof TypeDateSchema>;

export const TypeDateTimeSchema = z.object({ type: z.literal(TypeName.DATETIME) });
export type TypeDateTime = z.infer<typeof TypeDateTimeSchema>;

export const TypeObjectSchema = z.object({
  type: z.literal(TypeName.OBJECT),
  properties: z.record(
    z.string(),
    z.lazy(() => TypeSchema),
  ),
}) satisfies z.ZodType<TypeObject>;
export type TypeObject = {
  type: TypeName.OBJECT;
  properties: Record<string, Type>;
};

export const TypeListSchema = z.object({
  type: z.literal(TypeName.LIST),
  elements: z.lazy(() => TypeSchema),
  size: z.union([z.number().int(), InputRefSchema]).nullish(),
  defaultLimit: z.number().int().nonnegative().nullish(),
  min: z.number().int().nonnegative().nullish(),
  max: z.number().int().nonnegative().nullish(),
}) satisfies z.ZodType<TypeList>;
export type TypeList = {
  type: TypeName.LIST;
  elements: Type;
  size?: number | InputRef | null;
  defaultLimit?: number | null;
  min?: number | null;
  max?: number | null;
};

export const TypeDictSchema = z.object({
  type: z.literal(TypeName.DICT),
  elements: z.lazy(() => TypeSchema),
}) satisfies z.ZodType<TypeDict>;
export type TypeDict = {
  type: TypeName.DICT;
  elements: Type;
};

export const TypeOneOfSchema = z.object({
  type: z.literal(TypeName.ONE_OF),
  variants: z.array(z.lazy(() => TypeSchema)),
}) satisfies z.ZodType<TypeOneOf>;
export type TypeOneOf = {
  type: TypeName.ONE_OF;
  variants: Type[];
};

export const TypeAnySchema = z.object({ type: z.literal(TypeName.ANY) });
export type TypeAny = z.infer<typeof TypeAnySchema>;

export const TypeImageSchema = z.object({ type: z.literal(TypeName.IMAGE) });
export type TypeImage = z.infer<typeof TypeImageSchema>;

export const TypeAudioSchema = z.object({
  type: z.literal(TypeName.AUDIO),
  formats: z
    .array(z.string())
    .optional()
    .describe(
      Object.values(ContentTypeEnum)
        .filter((ct) => ct.category === ContentCategory.AUDIO)
        .map((ct) => ct.name)
        .join(", "),
    )
    .optional(),
  extensions: z.array(z.string()).optional(),
  maxFileSize: z.number().int().optional().describe("Max audio file size in bytes."),
});
export type TypeAudio = z.infer<typeof TypeAudioSchema>;

export const TypeVideoSchema = z.object({ type: z.literal(TypeName.VIDEO) });
export type TypeVideo = z.infer<typeof TypeVideoSchema>;

export const TypeThreeDimensionalSchema = z.object({ type: z.literal(TypeName.THREE_DIMENSIONAL) });
export type TypeThreeDimensional = z.infer<typeof TypeThreeDimensionalSchema>;

export const TypeFileSchema = z.object({ type: z.literal(TypeName.FILE) });
export type TypeFile = z.infer<typeof TypeFileSchema>;

export const TypeCallSchema = z.object({ type: z.literal(TypeName.CALL) });
export type TypeCall = z.infer<typeof TypeCallSchema>;

export const TypeNodeCallSchema = z.object({ type: z.literal(TypeName.NODE_CALL) });
export type TypeNodeCall = z.infer<typeof TypeNodeCallSchema>;

export const TypeExternalSchema = z.object({
  type: z.literal(TypeName.AUTH_TOKEN),
  service: z.nativeEnum(ExternalService).nullish(),
});
export type TypeExternal = z.infer<typeof TypeExternalSchema>;

export const TypeSchema: z.ZodType<Type> = z
  .discriminatedUnion("type", [
    // Primitive types.
    TypeBooleanSchema,
    TypeNumberSchema,
    TypeIntegerSchema,
    TypeStringSchema,
    TypeEnumSchema,
    TypeVectorSchema,
    TypeDateSchema,
    TypeDateTimeSchema,

    // Complex types.
    TypeObjectSchema,
    TypeListSchema,
    TypeDictSchema,
    TypeOneOfSchema,
    TypeAnySchema,

    // Media types.
    TypeImageSchema,
    TypeAudioSchema,
    TypeVideoSchema,
    TypeThreeDimensionalSchema,
    TypeFileSchema,

    // Reference types.
    TypeCallSchema,
    TypeNodeCallSchema,

    // External types.
    TypeExternalSchema,
  ])
  .and(z.object({ optional: z.boolean().nullish() }));
export type Type = // Primitive types.
  (
    | TypeBoolean
    | TypeNumber
    | TypeInteger
    | TypeString
    | TypeEnum
    | TypeVector
    | TypeDate
    | TypeDateTime
    // Complex types.
    | TypeObject
    | TypeList
    | TypeDict
    | TypeOneOf
    | TypeAny
    // Media types.
    | TypeImage
    | TypeAudio
    | TypeVideo
    | TypeThreeDimensional
    | TypeFile
    // Reference types.
    | TypeCall
    | TypeNodeCall
    // External types.
    | TypeExternal
  ) & { optional?: boolean | null };

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
      case TypeName.DATE:
        return { type: "object", properties: { date: { type: "string", format: "date" } } };
      case TypeName.DATETIME:
        return { type: "object", properties: { date: { type: "string", format: "date-time" } } };
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
