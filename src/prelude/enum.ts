import { Rec } from "./rec";

export namespace Enum {
  export function of<ValueKey extends string, Variant extends object>(): {
    create: <Value extends string, E extends Rec<string, Variant & { [vk in ValueKey]: Value }>>(
      e: E,
    ) => E;
  } {
    return {
      create: (e) => e,
    };
  }

  export type Native<ValueKey extends string, E> =
    E extends Rec<infer Key, infer Variant extends { [vk in ValueKey]: any }>
      ? { [k in keyof E]: E[k][ValueKey] }
      : never;

  export type Value<ValueKey extends string, E extends Rec<any, any>> =
    E extends Rec<infer Key, infer Variant extends { [vk in ValueKey]: any }>
      ? Variant[ValueKey]
      : never;

  export type Variant<ValueKey extends string, E extends Rec<any, any>> =
    E extends Rec<infer Key, infer Variant extends { [vk in ValueKey]: any }> ? Variant : never;

  export function toNative<ValueKey extends string, E extends Rec<any, any>>(
    vk: ValueKey,
    e: E,
  ): Native<ValueKey, E> {
    return Rec.map(([k, v]: [string, any]) => [k, v[vk]])(e) as any;
  }

  export function variant<ValueKey extends string, E extends Rec<any, any>>(
    vk: ValueKey,
    e: E,
  ): { get: <Value extends Enum.Value<ValueKey, E>>(value: Value) => Enum.Variant<ValueKey, E> } {
    return {
      get: <Value extends Enum.Value<ValueKey, E>>(value: Value): Enum.Variant<ValueKey, E> => {
        for (const k in e) {
          if (e[k][vk] === value) {
            return e[k] as Enum.Variant<ValueKey, E>;
          }
        }
        throw new Error(`Invalid value: ${value}`);
      },
    };
  }
}
