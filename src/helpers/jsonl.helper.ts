import { List, pipe } from "@/prelude";

export async function jsonl(response: Response, cb: (data: any) => Promise<any>): Promise<void> {
  let buffer = "";
  const flush = async (): Promise<void> => {
    if (buffer.trim().length === 0) return;
    const lines = buffer.split("\n");
    await pipe(
      lines.slice(0, -1), // last line is incomplete.
      List.map((line) => cb(JSON.parse(line))),
      (promises) => Promise.all(promises),
    );
    buffer = lines[lines.length - 1] ?? "";
  };

  for await (const chunk of response.body!) {
    const chunkText = new TextDecoder().decode(chunk);
    buffer += chunkText;
    await flush();
  }
  buffer += "\n"; // flush last line
  await flush();
}
