import Ajv from "ajv";

import { Type, TypeName } from "./data.type";

const ajv = new Ajv();

describe("data.type", () => {
  describe("Type.toJSONSchema", () => {
    it("should generate a valid JSON schema", async () => {
      const t: Type = {
        type: TypeName.OBJECT,
        properties: {
          b: { type: TypeName.BOOLEAN },
          s: { type: TypeName.STRING, min: 1 },
          e: { type: TypeName.ENUM, variants: ["a", "b", "c"] },
          i: { type: TypeName.INTEGER, min: 1, max: 99 },
          l: { type: TypeName.LIST, elements: { type: TypeName.STRING } },
          d: { type: TypeName.DICT, elements: { type: TypeName.STRING } },
          o: {
            type: TypeName.OBJECT,
            properties: {
              u: {
                type: TypeName.ONE_OF,
                variants: [{ type: TypeName.STRING }, { type: TypeName.INTEGER }],
              },
            },
          },
          a: { type: TypeName.ANY },
        },
      };
      const schema = Type.toJSONSchema(t);
      const isValidSchema = ajv.validateSchema(schema);
      expect(ajv.errors).toBe(null);
      expect(isValidSchema).toBe(true);
    });
  });
});
