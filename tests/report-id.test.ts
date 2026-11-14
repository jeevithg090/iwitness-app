import { describe, expect, it } from "vitest";
import { generateReportId, isValidReportId, normalizeReportId } from "@/lib/report-id";

describe("report IDs", () => {
  it("generates valid, unique 16-char hex IDs", () => {
    const ids = new Set(Array.from({ length: 1000 }, generateReportId));
    expect(ids.size).toBe(1000);
    for (const id of ids) expect(isValidReportId(id)).toBe(true);
  });

  it("normalises user input", () => {
    expect(normalizeReportId("  ABCDEF0123456789\n")).toBe("abcdef0123456789");
  });
});
