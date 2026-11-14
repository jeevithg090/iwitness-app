import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/authz";
import { jsonError, parseJsonBody, tooManyRequests } from "@/lib/http";
import { clientKey, createRateLimiter } from "@/lib/rate-limit";
import { publicReportSelect, staffReportSelect } from "@/lib/reports";
import { reportIdSchema, updateStatusSchema } from "@/lib/validation";

type Context = { params: Promise<{ reportId: string }> };

const lookupLimiter = createRateLimiter({ limit: 30, windowMs: 60 * 1000 });

/** GET /api/reports/:reportId: public status lookup for the reporter. */
export async function GET(request: Request, { params }: Context) {
  const rate = lookupLimiter(clientKey(request, "track-report"));
  if (!rate.ok) return tooManyRequests(rate);

  const id = reportIdSchema.safeParse((await params).reportId);
  if (!id.success) return jsonError(400, id.error.issues[0].message);

  try {
    const report = await prisma.report.findUnique({
      where: { reportId: id.data },
      select: publicReportSelect,
    });
    if (!report) return jsonError(404, "No report found with that ID");
    return NextResponse.json(report, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Failed to fetch report:", error);
    return jsonError(500, "Failed to fetch report details");
  }
}

/** PATCH /api/reports/:reportId: moderators update the report status. */
export async function PATCH(request: Request, { params }: Context) {
  const auth = await requireStaff();
  if (!auth.ok) return auth.response;

  const id = reportIdSchema.safeParse((await params).reportId);
  if (!id.success) return jsonError(400, id.error.issues[0].message);

  const body = await parseJsonBody(request, updateStatusSchema, 1_000);
  if (!body.ok) return body.response;

  try {
    const report = await prisma.report.update({
      where: { reportId: id.data },
      data: { status: body.data.status },
      select: staffReportSelect,
    });
    return NextResponse.json(report);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return jsonError(404, "Report not found");
    }
    console.error("Failed to update report:", error);
    return jsonError(500, "Error updating report");
  }
}
