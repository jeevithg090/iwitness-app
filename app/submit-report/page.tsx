import type { Metadata } from "next";
import { Lock } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { ReportWizard } from "@/components/report/report-wizard";

export const metadata: Metadata = {
  title: "Submit a report",
  description:
    "File an anonymous incident report. No account or personal details required.",
};

export default function SubmitReportPage() {
  return (
    <div className="container max-w-3xl py-16 sm:py-20">
      <PageHeader
        eyebrow="Secure & anonymous"
        icon={Lock}
        title="Submit an anonymous report"
        description="No name, email or account needed. Add as much detail as you safely can."
      />
      <div className="mt-10">
        <ReportWizard />
      </div>
    </div>
  );
}
