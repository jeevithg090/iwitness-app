import type { Prisma } from "@prisma/client";

/** Fields that anyone holding a report ID may see on the public tracking page. */
export const publicReportSelect = {
  reportId: true,
  type: true,
  reportType: true,
  title: true,
  description: true,
  location: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ReportSelect;

/** Fields shown to moderators in the dashboard list (images are fetched lazily). */
export const staffReportSelect = {
  ...publicReportSelect,
  id: true,
  latitude: true,
  longitude: true,
} satisfies Prisma.ReportSelect;

export type PublicReport = Prisma.ReportGetPayload<{ select: typeof publicReportSelect }>;
export type StaffReport = Prisma.ReportGetPayload<{
  select: typeof staffReportSelect;
}> & {
  hasImage: boolean;
};
