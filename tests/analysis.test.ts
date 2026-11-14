import { describe, expect, it } from "vitest";
import { matchCategory, parseAnalysis, splitDataUrl } from "@/lib/analysis";

describe("parseAnalysis", () => {
  it("parses the expected TITLE/TYPE/DESCRIPTION format", () => {
    const text = `TITLE: Car on fire in parking lot
TYPE: Fire Outbreak
DESCRIPTION: A sedan is burning in an open-air car park.
Smoke is drifting toward nearby buildings.`;
    expect(parseAnalysis(text)).toEqual({
      title: "Car on fire in parking lot",
      category: "Fire Outbreak",
      description:
        "A sedan is burning in an open-air car park. Smoke is drifting toward nearby buildings.",
    });
  });

  it("tolerates markdown emphasis and lower-case labels", () => {
    const result = parseAnalysis(
      "**Title:** Broken window\n**type:** theft\n**Description:** Glass shattered.",
    );
    expect(result?.title).toBe("Broken window");
    expect(result?.category).toBe("Theft");
    expect(result?.description).toBe("Glass shattered.");
  });

  it("returns null when required fields are missing", () => {
    expect(parseAnalysis("I cannot help with that.")).toBeNull();
    expect(parseAnalysis("TITLE: Only a title")).toBeNull();
  });
});

describe("matchCategory", () => {
  it("maps unknown or fuzzy values onto known categories", () => {
    expect(matchCategory("Medical emergency")).toBe("Medical Emergency");
    expect(matchCategory("Possible theft / burglary")).toBe("Theft");
    expect(matchCategory("Vandalism")).toBe("Other");
    expect(matchCategory(undefined)).toBe("Other");
  });
});

describe("splitDataUrl", () => {
  it("extracts mime type and payload", () => {
    expect(splitDataUrl("data:image/jpeg;base64,QUJD")).toEqual({
      mimeType: "image/jpeg",
      data: "QUJD",
    });
  });

  it("rejects non data URLs", () => {
    expect(splitDataUrl("https://example.com/a.jpg")).toBeNull();
  });
});
