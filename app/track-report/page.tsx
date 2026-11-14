import { Suspense } from "react";
import type { Metadata } from "next";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { ReportTracker } from "@/components/report/report-tracker";

export const metadata: Metadata = {
  title: "Track a report",
  description: "Check the status of an anonymous report using its private report ID.",
};

export default function TrackReportPage() {
  return (
    <div className="container py-16 sm:py-20">
      <PageHeader
        eyebrow="Track your report"
        icon={Search}
        title={
          <>
            Track your report
            <span className="text-gradient block">Stay informed</span>
          </>
        }
        description="Enter the report ID you received after submitting to see its current status."
      />
      <div className="mt-10">
        <Suspense>
          <ReportTracker />
        </Suspense>
      </div>
    </div>
  );
}
