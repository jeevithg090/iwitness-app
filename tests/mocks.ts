import { vi } from "vitest";

/** In-memory stand-ins for the Prisma client and NextAuth session lookup. */
export const prismaMock = {
  report: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    groupBy: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
};

export const getServerSessionMock = vi.fn();

vi.mock("@/lib/prisma", () => ({ default: prismaMock, prisma: prismaMock }));
vi.mock("next-auth", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next-auth")>()),
  getServerSession: getServerSessionMock,
}));

export function asRole(role: "ADMIN" | "MODERATOR" | "USER" | null) {
  getServerSessionMock.mockResolvedValue(
    role
      ? { user: { id: "1", name: "Test", email: "t@example.com", role }, expires: "" }
      : null,
  );
}

let ip = 0;
/** Unique IP per request so the module-level rate limiters don't interfere between tests. */
export function jsonRequest(url: string, method: string, body?: unknown) {
  ip += 1;
  return new Request(`http://localhost${url}`, {
    method,
    headers: { "content-type": "application/json", "x-forwarded-for": `10.0.0.${ip}` },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
