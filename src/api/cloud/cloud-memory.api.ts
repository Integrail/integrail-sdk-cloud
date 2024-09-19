import { BaseApi } from "@/api/base.api";
import { z } from "@/prelude/zod";

export class CloudMemoryApi extends BaseApi {
  public async upload(payload: MemoryUploadRequest): Promise<void> {
    await this.post("api/memory", payload).then((r) => r.json());
  }
}

export const MemoryUploadItemSchema = z.object({
  input: z.string().min(1),
  inputFull: z.string().optional(),
});
export type MemoryUploadItem = z.infer<typeof MemoryUploadItemSchema>;

export const MemoryUploadRequestSchema = z.object({
  items: z.array(MemoryUploadItemSchema),
  storeId: z.string().min(1),
});
export type MemoryUploadRequest = z.infer<typeof MemoryUploadRequestSchema>;
