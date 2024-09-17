import fetch from "cross-fetch";

import "@/polyfills/ReadableStream";

import { z } from "@/prelude/zod";

export class BaseApi {
  protected readonly options: ApiOptions;

  constructor(params: ApiParams) {
    this.options = ApiOptionsSchema.parse(params);
  }

  protected async fetch(path: string, init?: RequestInit): Promise<Response> {
    const response = await fetch(`${this.options.baseUri}/${path}`, {
      ...init,
      headers: { ...init?.headers, Authorization: `Bearer ${this.options.apiToken}` },
    });
    if (response.status >= 200 && response.status < 300) return response;
    throw new Error(`Request failed with status ${response.status}`);
  }

  protected async get(path: string): Promise<Response> {
    return this.fetch(path);
  }

  protected async post(path: string, body: any): Promise<Response> {
    return this.fetch(path, {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
  }

  protected async delete(path: string): Promise<Response> {
    return this.fetch(path, {
      method: "DELETE",
    });
  }
}

export const BaseResponseSchema = z.object({ status: z.literal("ok").default("ok") });

export const ApiOptionsSchema = z.object({
  baseUri: z.string().url().default("https://api.integrail.ai"),
  apiToken: z.string(),
});

export type ApiParams = z.input<typeof ApiOptionsSchema>;
export type ApiOptions = z.infer<typeof ApiOptionsSchema>;
