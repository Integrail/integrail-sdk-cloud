import { z } from "@/prelude/zod";

export const AccountIdSchema = z.string();
export type AccountId = z.infer<typeof AccountIdSchema>;
