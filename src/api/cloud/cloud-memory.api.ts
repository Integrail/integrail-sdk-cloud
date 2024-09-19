import { BaseApi, BaseResponseSchema } from "@/api/base.api";
import { z } from "@/prelude/zod";
import { EmbeddingSchema } from "@/types/embedding.type";

export class CloudMemoryApi extends BaseApi {
  public async list(accountId: string, storeId: string): Promise<MemoryListResponse> {
    const json = await this.httpGet(`api/${accountId}/memory/${storeId}`).then((r) => r.json());
    return MemoryListResponseSchema.parse(json);
  }

  public async upload(
    accountId: string,
    storeId: string,
    payload: MemoryUploadRequest,
  ): Promise<void> {
    await this.httpPost(`api/${accountId}/memory/${storeId}`, payload).then((r) => r.json());
  }

  public async delete(accountId: string, storeId: string, itemId: string): Promise<void> {
    await this.httpDelete(`api/${accountId}/memory/${storeId}/${itemId}`).then((r) => r.json());
  }
}

export const MemoryListResponseSchema = BaseResponseSchema.extend({
  items: z.array(EmbeddingSchema),
});
export type MemoryListResponse = z.infer<typeof MemoryListResponseSchema>;

export const MemoryUploadItemSchema = z.object({
  input: z.string().min(1),
  inputFull: z.string().optional(),
});
export type MemoryUploadItem = z.infer<typeof MemoryUploadItemSchema>;

export const MemoryUploadRequestSchema = z.object({
  items: z.array(MemoryUploadItemSchema),
});
export type MemoryUploadRequest = z.infer<typeof MemoryUploadRequestSchema>;
