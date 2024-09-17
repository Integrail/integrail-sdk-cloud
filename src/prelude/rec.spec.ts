import { Rec } from "./rec";

describe("Rec", () => {
  it("mergeWith", () => {
    const mergeAdd = Rec.mergeWith((a, b) => a + b, 0);
    expect(mergeAdd({ a: 1, b: 2, c: 3 }, { a: 10, b: 100, c: 1000 })).toEqual({
      a: 11,
      b: 102,
      c: 1003,
    });
    expect(mergeAdd({ a: 1, b: 2, c: 3 }, { a: 10 })).toEqual({ a: 11, b: 2, c: 3 });
    expect(mergeAdd({ a: 1 }, { a: 10, b: 100, c: 1000 })).toEqual({ a: 11, b: 100, c: 1000 });

    const mergeConcat = Rec.mergeWith((a, b) => `${a}${b}`, "");
    expect(mergeConcat({ a: "Hello, ", b: "Lorem ipsum" }, { a: "World!" })).toEqual({
      a: "Hello, World!",
      b: "Lorem ipsum",
    });
  });
});
