import { getServerSession, type Session } from "next-auth";
import { authOptions } from "./auth";
import { STAFF_ROLES } from "./constants";
import { jsonError } from "./http";

export function isStaffRole(role: string | null | undefined): boolean {
  return !!role && (STAFF_ROLES as readonly string[]).includes(role);
}

type StaffCheck = { ok: true; session: Session } | { ok: false; response: Response };

/** Ensures the caller is a signed-in ADMIN or MODERATOR. */
export async function requireStaff(): Promise<StaffCheck> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { ok: false, response: jsonError(401, "Sign in required") };
  if (!isStaffRole(session.user.role)) {
    return {
      ok: false,
      response: jsonError(403, "You do not have access to this resource"),
    };
  }
  return { ok: true, session };
}
