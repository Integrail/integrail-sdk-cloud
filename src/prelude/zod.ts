import * as zod from "zod";
import { extendZodWithOpenApi } from "@anatine/zod-openapi";

extendZodWithOpenApi(zod.z);
export * from "zod";

export const DateStringSchema = zod.z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
