import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { jsonError, parseJsonBody, tooManyRequests } from "@/lib/http";
import { clientKey, createRateLimiter } from "@/lib/rate-limit";
import { signupSchema } from "@/lib/validation";

const limiter = createRateLimiter({ limit: 5, windowMs: 15 * 60 * 1000 });

/**
 * Creates a regular (USER) account. The role is never taken from the request:
 * staff roles are granted only via `npm run create-admin` or the database.
 */
export async function POST(request: Request) {
  const rate = limiter(clientKey(request, "signup"));
  if (!rate.ok) return tooManyRequests(rate);

  const body = await parseJsonBody(request, signupSchema, 10_000);
  if (!body.ok) return body.response;
  const { name, email, password } = body.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return jsonError(409, "An account with this email already exists", {
        fields: { email: "An account with this email already exists" },
      });
    }

    const user = await prisma.user.create({
      data: { name, email, password: await bcrypt.hash(password, 12), role: "USER" },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Signup failed:", error);
    return jsonError(500, "Could not create the account. Please try again.");
  }
}
