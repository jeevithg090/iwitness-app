"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ReportForm } from "./report-form";
import { ReportSubmitted } from "./report-submitted";

/** Switches between the report form and the confirmation screen. */
export function ReportWizard() {
  const [reportId, setReportId] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);

  return (
    <Card className="p-5 sm:p-8">
      {reportId ? (
        <ReportSubmitted
          reportId={reportId}
          onReset={() => {
            setReportId(null);
            setFormKey((key) => key + 1);
          }}
        />
      ) : (
        <ReportForm
          key={formKey}
          onSubmitted={(id) => {
            setReportId(id);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}
    </Card>
  );
}
