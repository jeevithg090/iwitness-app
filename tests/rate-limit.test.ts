import { describe, expect, it } from "vitest";
import { clientKey, createRateLimiter } from "@/lib/rate-limit";

describe("createRateLimiter", () => {
  it("allows up to the limit within a window, then blocks", () => {
    const check = createRateLimiter({ limit: 2, windowMs: 1000 });
    expect(check("a", 0).ok).toBe(true);
    expect(check("a", 10).ok).toBe(true);
    const blocked = check("a", 20);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSeconds).toBe(1);
    // Different keys are independent.
    expect(check("b", 20).ok).toBe(true);
  });

  it("resets after the window", () => {
    const check = createRateLimiter({ limit: 1, windowMs: 1000 });
    check("a", 0);
    expect(check("a", 500).ok).toBe(false);
    expect(check("a", 1000).ok).toBe(true);
  });
});

describe("clientKey", () => {
  it("uses the first forwarded IP", () => {
    const request = new Request("http://x", {
      headers: { "x-forwarded-for": "1.2.3.4, 10.0.0.1" },
    });
    expect(clientKey(request, "scope")).toBe("scope:1.2.3.4");
  });
});
