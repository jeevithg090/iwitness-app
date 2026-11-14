import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { requireStaff } from "@/lib/authz";
import { REPORT_STATUSES } from "@/lib/constants";
import { jsonError, parseJsonBody, tooManyRequests } from "@/lib/http";
import { clientKey, createRateLimiter } from "@/lib/rate-limit";
import { generateReportId } from "@/lib/report-id";
import { staffReportSelect } from "@/lib/reports";
import { createReportSchema, reportFiltersSchema } from "@/lib/validation";

const createLimiter = createRateLimiter({ limit: 10, windowMs: 10 * 60 * 1000 });
const LIST_LIMIT = 200;

/** POST /api/reports: submit an anonymous report (public). */
export async function POST(request: Request) {
  const rate = createLimiter(clientKey(request, "create-report"));
  if (!rate.ok) return tooManyRequests(rate);

  const body = await parseJsonBody(request, createReportSchema, 5_000_000);
  if (!body.ok) return body.response;
  const input = body.data;

  try {
    // Retry on the (astronomically unlikely) chance of an ID collision.
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const report = await prisma.report.create({
          data: {
            reportId: generateReportId(),
            type: input.type,
            reportType: input.category,
            title: input.title,
            description: input.description,
            location: input.location,
            latitude: input.latitude ?? null,
            longitude: input.longitude ?? null,
            image: input.image ?? null,
          },
          select: { reportId: true, status: true, createdAt: true },
        });
        return NextResponse.json(report, { status: 201 });
      } catch (error) {
        const collision =
          error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
        if (!collision) throw error;
      }
    }
    return jsonError(500, "Could not allocate a report ID. Please try again.");
  } catch (error) {
    console.error("Failed to create report:", error);
    return jsonError(500, "We could not submit your report. Please try again.");
  }
}

/** GET /api/reports?status=&type=: list reports for moderators. */
export async function GET(request: Request) {
  const auth = await requireStaff();
  if (!auth.ok) return auth.response;

  const params = Object.fromEntries(new URL(request.url).searchParams);
  const filters = reportFiltersSchema.safeParse({
    status: params.status || undefined,
    type: params.type || undefined,
  });
  if (!filters.success) return jsonError(400, "Invalid filter");

  try {
    const [reports, withImage, grouped] = await Promise.all([
      prisma.report.findMany({
        where: filters.data,
        orderBy: { createdAt: "desc" },
        take: LIST_LIMIT,
        select: staffReportSelect,
      }),
      prisma.report.findMany({
        where: { ...filters.data, image: { not: null } },
        select: { id: true },
      }),
      prisma.report.groupBy({ by: ["status"], _count: { _all: true } }),
    ]);

    const imageIds = new Set(withImage.map((r) => r.id));
    const counts = Object.fromEntries(REPORT_STATUSES.map((s) => [s, 0])) as Record<
      (typeof REPORT_STATUSES)[number],
      number
    >;
    for (const row of grouped) counts[row.status] = row._count._all;

    return NextResponse.json({
      reports: reports.map((r) => ({ ...r, hasImage: imageIds.has(r.id) })),
      counts,
      limit: LIST_LIMIT,
    });
  } catch (error) {
    console.error("Failed to fetch reports:", error);
    if (error instanceof Prisma.PrismaClientInitializationError) {
      return jsonError(503, "Cannot connect to the database. Please try again later.");
    }
    return jsonError(500, "Failed to fetch reports");
  }
}
