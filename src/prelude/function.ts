import * as fp from "fp-ts";

export const { pipe, flow } = fp.function;

export type FunctionReturnType<T extends (...args: any[]) => any, U extends any[]> = T extends (
  ...args: U
) => infer R
  ? R
  : never;
