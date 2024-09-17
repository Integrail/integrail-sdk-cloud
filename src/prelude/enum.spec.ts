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
    const AnimalVariant = Enum.variant("name", AnimalEnum);

    const dog = AnimalVariant.get(Animal.DOG);
    expect(dog.name).toBe("dog");
    expect(dog.sound).toBe("bark");
  });
});
