import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const STAFF_ROLES = new Set(["ADMIN", "MODERATOR"]);

/**
 * Protects the moderator dashboard. Unauthenticated visitors are sent to the
 * sign-in page by `withAuth`; signed-in users without a staff role are
 * redirected there with an explanatory error code.
 */
export default withAuth(
  function middleware(req) {
    if (!STAFF_ROLES.has(req.nextauth.token?.role ?? "")) {
      const url = new URL("/auth/signin", req.url);
      url.searchParams.set("error", "AccessDenied");
      return NextResponse.redirect(url);
    }
  },
  {
    callbacks: { authorized: ({ token }) => !!token },
    pages: { signIn: "/auth/signin" },
  },
);

export const config = { matcher: ["/dashboard/:path*"] };
