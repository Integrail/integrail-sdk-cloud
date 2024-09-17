import { Option } from "./option";

export namespace List {
  export function map<A, B>(f: (a: A) => B): (as: Iterable<A>) => Generator<B> {
    return function* (as) {
      for (const a of as) {
        yield f(a);
      }
    };
  }

  export function mapOption<A, B>(f: (a: A) => Option<B>): (as: Iterable<A>) => Generator<B> {
    return function* (as) {
      for (const a of as) {
        const option = f(a);
        if (Option.isSome(option)) yield option.value;
      }
    };
  }

  export function mapAsync<A, B>(f: (a: A) => Promise<B>): (as: Iterable<A>) => AsyncGenerator<B> {
    return async function* (as) {
      for (const a of as) {
        yield await f(a);
      }
    };
  }

  export function filter<A>(predicate: (a: A) => boolean): (as: Iterable<A>) => Generator<A> {
    return function* (as) {
      for (const a of as) {
        if (predicate(a)) {
          yield a;
        }
      }
    };
  }

  export function reduce<A, Acc>(f: (b: Acc, a: A) => Acc, b: Acc): (as: Iterable<A>) => Acc {
    return function (as) {
      let result = b;
      for (const a of as) {
        result = f(result, a);
      }
      return result;
    };
  }

  export function take(n: number): <A>(as: Iterable<A>) => Generator<A> {
    return function* (as) {
      let i = 0;
      for (const a of as) {
        if (i >= n) {
          break;
        }
        yield a;
        i++;
      }
    };
  }

  export function toArray<A>(as: Iterable<A>): A[] {
    return [...as];
  }
}
