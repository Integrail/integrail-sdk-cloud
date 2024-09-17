import { AbortController, AbortSignal } from "node-abort-controller";

((global: any): void => {
  if (typeof global.AbortController === "undefined") {
    global.AbortController = AbortController;
    global.AbortSignal = AbortSignal;
  }
})(
  typeof self !== "undefined"
    ? self
    : typeof window !== "undefined"
      ? window
      : typeof global !== "undefined"
        ? global
        : undefined,
);
