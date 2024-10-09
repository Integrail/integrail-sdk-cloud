import { Rec } from "./rec";

export namespace Enum {
  export class Handler<ValueKey extends string, E extends Rec<string, any>> {
    constructor(
      private vk: ValueKey,
      private e: E,
    ) {}

    get(value: Value<ValueKey, E>): Variant<ValueKey, E> {
      const variant = this.getNullable(value);
      if (variant != null) return variant;
      throw new Error(`Invalid value: ${value}`);
    }

    getNullable(value: Value<ValueKey, E>): Variant<ValueKey, E> | null {
      for (const k in this.e) {
        if (this.e[k][this.vk] === value) return this.e[k];
      }
      return null;
    }

    matchValue<R>(
      value: Value<ValueKey, E>,
      matcher: Matcher<Value<ValueKey, E>, Variant<ValueKey, E>, R>,
    ): R;
    matchValue<R>(
      value: Value<ValueKey, E>,
      matcher: PartialMatcher<Value<ValueKey, E>, Variant<ValueKey, E>, R>,
      def: () => R,
    ): R;
    matchValue<R>(
      value: Value<ValueKey, E>,
      matcher: PartialMatcher<Value<ValueKey, E>, Variant<ValueKey, E>, R>,
      def?: () => R,
    ): R {
      const variant = this.getNullable(value);
      if (variant != null && matcher[value] != null) return matcher[value](variant);
      if (def != null) return def();
      throw new Error(`Invalid value: ${value}`);
    }

    matchVariant<R>(
      variant: Variant<ValueKey, E>,
      matcher: Matcher<Value<ValueKey, E>, Variant<ValueKey, E>, R>,
    ): R;
    matchVariant<R>(
      variant: Variant<ValueKey, E>,
      matcher: PartialMatcher<Value<ValueKey, E>, Variant<ValueKey, E>, R>,
      def: () => R,
    ): R;
    matchVariant<R>(
      variant: Variant<ValueKey, E>,
      matcher: PartialMatcher<Value<ValueKey, E>, Variant<ValueKey, E>, R>,
      def?: () => R,
    ): R {
      const value = variant[this.vk];
      if (matcher[value] != null) return matcher[value](variant);
      if (def != null) return def();
      throw new Error(`Invalid value: ${value}`);
    }
  }

  export type Matcher<Value extends string, Variant, R> = { [k in Value]: (v: Variant) => R };
  export type PartialMatcher<Value extends string, Variant, R> = Partial<
    Matcher<Value, Variant, R>
  >;

  export function of<ValueKey extends string, Variant extends object>(): {
    create: <Value extends string, E extends Rec<string, Variant & { [vk in ValueKey]: Value }>>(
      e: E,
    ) => { [k in keyof E]: E[k] & Variant };
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

  export function handler<ValueKey extends string, E extends Rec<string, any>>(
    vk: ValueKey,
    e: E,
  ): Handler<ValueKey, E> {
    return new Handler(vk, e);
  }

  export function fromNative<E extends Rec<string, any>>(
    native: E,
  ): Record<keyof E, { name: E[keyof E] }> {
    return Rec.map(([k, v]: [string, any]) => [k, { name: v }])(native) as Record<
      keyof E,
      { name: E[keyof E] }
    >;
  }

  export function handlerFromNative<E extends Rec<string, any>>(
    native: E,
  ): Handler<"name", Record<keyof E, { name: E[keyof E] }>> {
    return new Handler<"name", Record<keyof E, { name: E[keyof E] }>>("name", fromNative(native));
  }
}
