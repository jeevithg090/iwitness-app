import { beforeEach, describe, expect, it, vi } from "vitest";
import bcrypt from "bcryptjs";
import { jsonRequest, prismaMock } from "./mocks";
import { POST as signup } from "@/app/api/auth/signup/route";
import { verifyCredentials } from "@/lib/auth";
import { isStaffRole } from "@/lib/authz";

beforeEach(() => vi.clearAllMocks());

describe("POST /api/auth/signup", () => {
  const body = {
    name: "Mallory",
    email: "Mallory@Example.com",
    password: "password123",
    role: "ADMIN",
  };

  it("always creates a USER, ignoring any requested role", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockImplementation(async ({ data }) => ({ id: 1, ...data }));

    const response = await signup(jsonRequest("/api/auth/signup", "POST", body));
    expect(response.status).toBe(201);

    const { data, select } = prismaMock.user.create.mock.calls[0][0];
    expect(data.role).toBe("USER");
    expect(data.email).toBe("mallory@example.com");
    expect(await bcrypt.compare("password123", data.password)).toBe(true);
    expect(select.password).toBeUndefined();
  });

  it("returns 409 for an existing email", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 1 });
    const response = await signup(jsonRequest("/api/auth/signup", "POST", body));
    expect(response.status).toBe(409);
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it("validates input", async () => {
    const response = await signup(
      jsonRequest("/api/auth/signup", "POST", { ...body, email: "nope" }),
    );
    expect(response.status).toBe(422);
  });
});

describe("verifyCredentials", () => {
  const hash = bcrypt.hashSync("correct-horse", 4);

  it("returns the user without the password hash on success", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 7,
      email: "mod@example.com",
      name: "Mod",
      role: "MODERATOR",
      password: hash,
    });
    const user = await verifyCredentials({
      email: "MOD@example.com",
      password: "correct-horse",
    });
    expect(user).toEqual({
      id: "7",
      email: "mod@example.com",
      name: "Mod",
      role: "MODERATOR",
    });
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: "mod@example.com" },
    });
  });

  it("returns null for a wrong password or unknown email (no enumeration)", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 7,
      password: hash,
      role: "ADMIN",
    });
    expect(
      await verifyCredentials({ email: "mod@example.com", password: "wrong" }),
    ).toBeNull();
    prismaMock.user.findUnique.mockResolvedValue(null);
    expect(
      await verifyCredentials({ email: "ghost@example.com", password: "whatever" }),
    ).toBeNull();
  });

  it("returns null for malformed input", async () => {
    expect(await verifyCredentials(undefined)).toBeNull();
    expect(await verifyCredentials({ email: "not-an-email", password: "x" })).toBeNull();
  });
});

describe("isStaffRole", () => {
  it("only treats ADMIN and MODERATOR as staff", () => {
    expect(isStaffRole("ADMIN")).toBe(true);
    expect(isStaffRole("MODERATOR")).toBe(true);
    expect(isStaffRole("USER")).toBe(false);
    expect(isStaffRole(undefined)).toBe(false);
  });
});
