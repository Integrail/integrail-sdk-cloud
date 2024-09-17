import { pipe } from "./function";
import { List } from "./list";

export type Rec<K extends keyof any, V> = Record<K, V>;
export type PartialRec<K extends keyof any, V> = Partial<Rec<K, V>>;
export type AnyRec = PartialRec<keyof any, any>;
export type EmptyRec = Rec<never, never>;

export namespace Rec {
  export function toEntries<K extends string, V>(r: Rec<K, V>): [K, V][] {
    return Object.entries(r) as [K, V][];
  }

  export function fromEntries<K extends string, V>(entries: [K, V][]): Rec<K, V> {
    return Object.fromEntries(entries) as Rec<K, V>;
  }

  export function map<K1 extends string, V1, K2 extends string, V2>(
    f: (_: [k: K1, v: V1]) => [K2, V2],
  ): (r: Rec<K1, V1>) => Rec<K2, V2> {
    return (r) => {
      return fromEntries(toEntries(r).map(f));
    };
  }

  export function mergeWith<T, R extends Rec<string, T>>(
    f: (a: T, b: T) => T,
    def: T,
  ): (r1: R, r2: R) => R {
    return (r1, r2) => {
      const keys = new Set([...Object.keys(r1), ...Object.keys(r2)]);
      return pipe(
        [...keys],
        List.map((k): [string, T] => [
          k,
          r1[k] != null && r2[k] != null ? f(r1[k], r2[k]) : (r1[k] ?? r2[k] ?? def),
        ]),
        List.toArray,
        fromEntries,
      ) as R;
    };
  }
}
