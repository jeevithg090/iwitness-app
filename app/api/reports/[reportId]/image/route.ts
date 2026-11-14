import prisma from "@/lib/prisma";
import { splitDataUrl } from "@/lib/analysis";
import { requireStaff } from "@/lib/authz";
import { jsonError } from "@/lib/http";
import { reportIdSchema } from "@/lib/validation";

type Context = { params: Promise<{ reportId: string }> };

/** GET /api/reports/:reportId/image: serves an attached photo to moderators. */
export async function GET(_request: Request, { params }: Context) {
  const auth = await requireStaff();
  if (!auth.ok) return auth.response;

  const id = reportIdSchema.safeParse((await params).reportId);
  if (!id.success) return jsonError(400, id.error.issues[0].message);

  const report = await prisma.report.findUnique({
    where: { reportId: id.data },
    select: { image: true },
  });
  const parts = report?.image ? splitDataUrl(report.image) : null;
  if (!parts) return jsonError(404, "No image attached");

  return new Response(Buffer.from(parts.data, "base64"), {
    headers: {
      "Content-Type": parts.mimeType,
      "Cache-Control": "private, max-age=3600",
      "Content-Security-Policy": "default-src 'none'",
    },
  });
}
