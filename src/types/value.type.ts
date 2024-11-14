import { z } from "@/prelude/zod";

import { ExternalService, TypeName } from "./data.type";

export const BooleanValueSchema = z.object({
  type: z.literal(TypeName.BOOLEAN),
  value: z.boolean(),
});
export type BooleanValue = z.infer<typeof BooleanValueSchema>;

export const NumberValueSchema = z.object({
  type: z.literal(TypeName.NUMBER),
  value: z.number(),
});
export type NumberValue = z.infer<typeof NumberValueSchema>;

export const IntegerValueSchema = z.object({
  type: z.literal(TypeName.INTEGER),
  value: z.number().int(),
});
export type IntegerValue = z.infer<typeof IntegerValueSchema>;

export const StringValueSchema = z.object({
  type: z.literal(TypeName.STRING),
  value: z.string(),
});
export type StringValue = z.infer<typeof StringValueSchema>;

export const VectorValueSchema = z.object({
  type: z.literal(TypeName.VECTOR),
  value: z.array(z.number()),
});
export type VectorValue = z.infer<typeof VectorValueSchema>;

export type ObjectValue = {
  type: TypeName.OBJECT;
  value: Record<string, Value>;
};
export const ObjectValueSchema: z.ZodType<ObjectValue> = z.object({
  type: z.literal(TypeName.OBJECT),
  value: z.record(
    z.string(),
    z.lazy(() => ValueSchema),
  ),
});

export type ListValue = {
  type: TypeName.LIST;
  value: Value[];
};
export const ListValueSchema: z.ZodType<ListValue> = z.object({
  type: z.literal(TypeName.LIST),
  value: z.array(z.lazy(() => ValueSchema)),
});

export type DictValue = {
  type: TypeName.DICT;
  value: Record<string, Value>;
};
export const DictValueSchema: z.ZodType<DictValue> = z.object({
  type: z.literal(TypeName.DICT),
  value: z.record(
    z.string(),
    z.lazy(() => ValueSchema),
  ),
});

export const UrlImageValueSchema = z.object({
  type: z.literal(TypeName.IMAGE),
  url: z.string(),
  contentType: z.string().optional(),
});
export type UrlImageValue = z.infer<typeof UrlImageValueSchema>;

export const Base64ImageValueSchema = z.object({
  type: z.literal(TypeName.IMAGE),
  base64: z.string(),
  contentType: z.string().optional(),
});
export type Base64ImageValue = z.infer<typeof Base64ImageValueSchema>;

export const ImageValueSchema = z.union([UrlImageValueSchema, Base64ImageValueSchema]);
export type ImageValue = z.infer<typeof ImageValueSchema>;

export const VideoValueSchema = z.object({
  type: z.literal(TypeName.VIDEO),
  url: z.string(),
  contentType: z.string().optional(),
});
export type VideoValue = z.infer<typeof VideoValueSchema>;

export const AudioValueSchema = z.object({
  type: z.literal(TypeName.AUDIO),
  url: z.string(),
  contentType: z.string().optional(),
});
export type AudioValue = z.infer<typeof AudioValueSchema>;

export const ThreeDimensionalValueSchema = z.object({
  type: z.literal(TypeName.THREE_DIMENSIONAL),
  url: z.string(),
  contentType: z.string().optional(),
});
export type ThreeDimensionalValue = z.infer<typeof ThreeDimensionalValueSchema>;

export const FileValueSchema = z.object({
  type: z.literal(TypeName.FILE),
  url: z.string(),
  contentType: z.string().optional(),
});
export type FileValue = z.infer<typeof FileValueSchema>;

export const AuthTokenValueSchema = z.object({
  type: z.literal(TypeName.AUTH_TOKEN),
  service: z.nativeEnum(ExternalService),
  value: z.string(),
});

export const ValueSchema = z.union([
  BooleanValueSchema,
  NumberValueSchema,
  IntegerValueSchema,
  StringValueSchema,
  VectorValueSchema,
  ObjectValueSchema,
  ListValueSchema,
  DictValueSchema,
  ImageValueSchema,
  VideoValueSchema,
  AudioValueSchema,
  ThreeDimensionalValueSchema,
  FileValueSchema,
  AuthTokenValueSchema,
]);
export type Value = z.infer<typeof ValueSchema>;

export namespace Value {
  export function fromJsValue(value: any): Value {
    if (
      typeof value === "object" &&
      "type" in value &&
      [
        TypeName.IMAGE,
        TypeName.AUDIO,
        TypeName.VIDEO,
        TypeName.THREE_DIMENSIONAL,
        TypeName.FILE,
      ].includes(value.type)
    ) {
      return value;
    }

    if (typeof value === "boolean") {
      return { type: TypeName.BOOLEAN, value };
    } else if (typeof value === "number") {
      return { type: TypeName.NUMBER, value };
    } else if (typeof value === "string") {
      return { type: TypeName.STRING, value };
    } else if (Array.isArray(value)) {
      return { type: TypeName.LIST, value: value.map(fromJsValue) };
    } else if (value instanceof Object) {
      return {
        type: TypeName.OBJECT,
        value: Object.fromEntries(
          Object.entries(value)
            .filter(([, v]) => v != null)
            .map(([k, v]) => [k, fromJsValue(v)]),
        ),
      };
    } else {
      throw new Error(`Invalid value: ${value}`);
    }
  }

  export function toJsValue(value: Value): any {
    switch (value.type) {
      case TypeName.BOOLEAN:
      case TypeName.NUMBER:
      case TypeName.INTEGER:
      case TypeName.STRING:
        return value.value;
      case TypeName.LIST:
        return value.value.map(toJsValue);
      case TypeName.VECTOR:
        return value.value;
      case TypeName.OBJECT:
        return Object.fromEntries(Object.entries(value.value).map(([k, v]) => [k, toJsValue(v)]));
      default:
        return value;
    }
  }
}
