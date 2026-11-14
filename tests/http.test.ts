import { describe, expect, it } from "vitest";
import { z } from "zod";
import { parseJsonBody } from "@/lib/http";

const schema = z.object({ name: z.string().min(2) });
const post = (body: string, headers: Record<string, string> = {}) =>
  new Request("http://localhost/api", { method: "POST", body, headers });

describe("parseJsonBody", () => {
  it("returns parsed data for valid JSON", async () => {
    const result = await parseJsonBody(post(JSON.stringify({ name: "Ann" })), schema);
    expect(result).toEqual({ ok: true, data: { name: "Ann" } });
  });

  it("responds 400 for malformed JSON", async () => {
    const result = await parseJsonBody(post("{nope"), schema);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(400);
  });

  it("responds 422 with field errors for invalid data", async () => {
    const result = await parseJsonBody(post(JSON.stringify({ name: "A" })), schema);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(422);
      expect((await result.response.json()).fields.name).toBeDefined();
    }
  });

  it("responds 413 when the body is too large", async () => {
    const result = await parseJsonBody(
      post(JSON.stringify({ name: "x".repeat(200) })),
      schema,
      100,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(413);
  });
});
