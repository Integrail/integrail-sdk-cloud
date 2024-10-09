import { Enum } from "./enum";

describe("Enum", () => {
  it("should convert custom enums to native enums", () => {
    const AnimalEnum = Enum.of<
      "name",
      {
        sound: string;
      }
    >().create({
      DOG: { name: "dog", sound: "bark" },
      CAT: { name: "cat", sound: "meow" },
      COW: { name: "cow", sound: "moo" },
    });

    type Animal = Enum.Value<"name", typeof AnimalEnum>;
    const Animal: {
      DOG: "dog";
      CAT: "cat";
      COW: "cow";
    } = Enum.toNative("name", AnimalEnum);

    expect(AnimalEnum.CAT.name).toBe("cat");
    expect(AnimalEnum.DOG.sound).toBe("bark");
    expect(Animal.COW).toBe("cow");

    type AnimalVariant = Enum.Variant<"name", typeof AnimalEnum>;
    const AnimalHandler = Enum.handler("name", AnimalEnum);

    const dog: AnimalVariant = AnimalHandler.get(Animal.DOG);
    expect(dog.name).toBe("dog");
    expect(dog.sound).toBe("bark");

    expect(
      AnimalHandler.matchValue(Animal.CAT, {
        [Animal.CAT]: () => "meow!",
        [Animal.DOG]: () => "bark!",
        [Animal.COW]: () => "moo!",
      }),
    ).toBe("meow!");

    expect(() => {
      AnimalHandler.matchValue("invalid" as Animal, {
        [Animal.CAT]: () => "meow!",
        [Animal.DOG]: () => "bark!",
        [Animal.COW]: () => "moo!",
      });
    }).toThrow();

    expect(AnimalHandler.matchValue(Animal.COW, {}, () => "*silence*")).toBe("*silence*");
    expect(AnimalHandler.matchValue("invalid" as Animal, {}, () => "*silence*")).toBe("*silence*");
  });

  it("should convert native enums to custom enums", () => {
    enum Animal {
      CAT = "cat",
      DOG = "dog",
      COW = "cow",
    }

    const AnimalEnum = Enum.fromNative(Animal);
    expect(AnimalEnum.CAT.name).toBe("cat");

    const AnimalHandler = Enum.handlerFromNative(Animal);
    expect(AnimalHandler.get(Animal.CAT)).toEqual({ name: "cat" });

    expect(
      AnimalHandler.matchValue(Animal.CAT, {
        [Animal.CAT]: () => "meow!",
        [Animal.DOG]: () => "bark!",
        [Animal.COW]: () => "moo!",
      }),
    ).toBe("meow!");
    expect(() => {
      AnimalHandler.matchValue("invalid" as Animal, {
        [Animal.CAT]: () => "meow!",
        [Animal.DOG]: () => "bark!",
        [Animal.COW]: () => "moo!",
      });
    }).toThrow();
    expect(AnimalHandler.matchValue("invalid" as Animal, {}, () => "*silence*")).toBe("*silence*");
  });
});
