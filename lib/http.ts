import { NextResponse } from "next/server";
import type { ZodType } from "zod";
import { fieldErrors } from "./validation";
import type { RateLimitResult } from "./rate-limit";

export function jsonError(
  status: number,
  error: string,
  extra?: Record<string, unknown>,
  headers?: HeadersInit,
) {
  return NextResponse.json({ error, ...extra }, { status, headers });
}

export function tooManyRequests(result: RateLimitResult) {
  return jsonError(
    429,
    "Too many requests. Please wait a moment and try again.",
    undefined,
    {
      "Retry-After": String(result.retryAfterSeconds),
    },
  );
}

type ParseResult<T> = { ok: true; data: T } | { ok: false; response: NextResponse };

/**
 * Reads a JSON body (rejecting bodies over `maxBytes`) and validates it.
 * Returns either the parsed data or a ready-to-return error response.
 */
export async function parseJsonBody<T>(
  request: Request,
  schema: ZodType<T>,
  maxBytes = 1_000_000,
): Promise<ParseResult<T>> {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > maxBytes) {
    return { ok: false, response: jsonError(413, "Request body is too large") };
  }

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return { ok: false, response: jsonError(400, "Could not read request body") };
  }
  if (raw.length > maxBytes) {
    return { ok: false, response: jsonError(413, "Request body is too large") };
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { ok: false, response: jsonError(400, "Request body must be valid JSON") };
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return {
      ok: false,
      response: jsonError(422, "Please check the highlighted fields", {
        fields: fieldErrors(parsed.error),
      }),
    };
  }
  return { ok: true, data: parsed.data };
}
