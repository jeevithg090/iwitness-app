import { describe, expect, it } from "vitest";
import {
  createReportSchema,
  fieldErrors,
  reportIdSchema,
  signupSchema,
  updateStatusSchema,
} from "@/lib/validation";

const valid = {
  type: "EMERGENCY",
  category: "Theft",
  title: "Stolen bike",
  description: "My neighbour's bike was taken from the rack.",
};

describe("createReportSchema", () => {
  it("accepts a minimal valid report and normalises empty location to null", () => {
    const result = createReportSchema.parse({ ...valid, location: "  " });
    expect(result.location).toBeNull();
    expect(result.title).toBe("Stolen bike");
  });

  it("rejects unknown categories and types", () => {
    const result = createReportSchema.safeParse({
      ...valid,
      type: "URGENT",
      category: "Aliens",
    });
    expect(result.success).toBe(false);
    const errors = fieldErrors(result.error!);
    expect(errors.type).toBeDefined();
    expect(errors.category).toBeDefined();
  });

  it("requires a description of at least 10 characters", () => {
    const result = createReportSchema.safeParse({ ...valid, description: "short" });
    expect(result.success).toBe(false);
    expect(fieldErrors(result.error!).description).toMatch(/at least 10/);
  });

  it("rejects out-of-range coordinates", () => {
    expect(createReportSchema.safeParse({ ...valid, latitude: 91 }).success).toBe(false);
    expect(createReportSchema.safeParse({ ...valid, longitude: -181 }).success).toBe(
      false,
    );
  });

  it("only accepts JPEG/PNG/WebP data URLs as images", () => {
    expect(
      createReportSchema.safeParse({ ...valid, image: "data:image/png;base64,AAAA" })
        .success,
    ).toBe(true);
    expect(
      createReportSchema.safeParse({ ...valid, image: "data:image/svg+xml;base64,AAAA" })
        .success,
    ).toBe(false);
    expect(
      createReportSchema.safeParse({ ...valid, image: "https://evil.example/x.png" })
        .success,
    ).toBe(false);
  });

  it("strips fields the client must not control (reportId, status)", () => {
    const result = createReportSchema.parse({
      ...valid,
      reportId: "x",
      status: "RESOLVED",
    });
    expect(result).not.toHaveProperty("reportId");
    expect(result).not.toHaveProperty("status");
  });
});

describe("reportIdSchema", () => {
  it("normalises case and whitespace", () => {
    expect(reportIdSchema.parse("  A1B2C3D4E5F60718 ")).toBe("a1b2c3d4e5f60718");
  });

  it("rejects malformed IDs", () => {
    for (const id of ["", "123", "zzzzzzzzzzzzzzzz", "a1b2c3d4e5f607189"]) {
      expect(reportIdSchema.safeParse(id).success).toBe(false);
    }
  });
});

describe("signupSchema", () => {
  it("lower-cases the email and enforces password length", () => {
    expect(
      signupSchema.parse({
        name: "Ann",
        email: "Ann@Example.COM",
        password: "longenough",
      }).email,
    ).toBe("ann@example.com");
    expect(
      signupSchema.safeParse({ name: "Ann", email: "a@b.co", password: "short" }).success,
    ).toBe(false);
  });

  it("does not let callers choose a role", () => {
    const parsed = signupSchema.parse({
      name: "Mallory",
      email: "m@example.com",
      password: "password123",
      role: "ADMIN",
    });
    expect(parsed).not.toHaveProperty("role");
  });
});

describe("updateStatusSchema", () => {
  it("accepts known statuses only", () => {
    expect(updateStatusSchema.safeParse({ status: "RESOLVED" }).success).toBe(true);
    expect(updateStatusSchema.safeParse({ status: "DELETED" }).success).toBe(false);
  });
});
