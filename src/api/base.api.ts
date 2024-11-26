import "@/polyfills/ReadableStream";

import { z } from "@/prelude/zod";

export class BaseApi {
  protected readonly options: ApiOptions;

  constructor(params: ApiParams) {
    this.options = ApiOptionsSchema.parse(params);
  }

  protected async fetch(path: string, init?: RequestInit): Promise<Response> {
    const f: typeof fetch = (this.options.fetch as any) ?? fetch;
    const response = await f(`${this.options.baseUri}/${path}`, {
      ...init,
      headers: { ...init?.headers, Authorization: `Bearer ${this.options.apiToken}` },
    });
    if (response.status >= 200 && response.status < 300) return response;
    throw new Error(`Request failed with status ${response.status}`);
  }

  protected async httpGet(path: string): Promise<Response> {
    return this.fetch(path);
  }

  protected async httpPost(path: string, body: any): Promise<Response> {
    return this.fetch(path, {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
  }

  protected async httpDelete(path: string): Promise<Response> {
    return this.fetch(path, {
      method: "DELETE",
    });
  }
}

export const BaseResponseSchema = z.object({ status: z.literal("ok").default("ok") });

export const ApiOptionsSchema = z.object({
  baseUri: z.string().url().default("https://cloud.integrail.ai"),
  apiToken: z.string(),
  fetch: z.function().optional(),
});

export type ApiParams = z.input<typeof ApiOptionsSchema>;
export type ApiOptions = z.infer<typeof ApiOptionsSchema>;
