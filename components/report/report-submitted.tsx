"use client";

import { useEffect, useRef, useState } from "react";
import { Check, CheckCircle2, Copy } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";

export function ReportSubmitted({
  reportId,
  onReset,
}: {
  reportId: string;
  onReset: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => headingRef.current?.focus(), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(reportId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; the ID is still visible and selectable.
    }
  };

  return (
    <div className="animate-fade-up space-y-6 text-center">
      <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/10 text-success">
        <CheckCircle2 className="size-9" aria-hidden="true" />
      </span>
      <div>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-2xl font-semibold focus:outline-none"
        >
          Report submitted
        </h2>
        <p className="mt-2 text-muted-foreground">
          Thank you. Moderators will review it shortly. No personal details were attached.
        </p>
      </div>

      <div className="mx-auto max-w-md rounded-xl border bg-muted/50 p-5 text-left">
        <p className="text-sm font-medium" id="report-id-label">
          Your report ID
        </p>
        <div className="mt-2 flex items-center gap-2">
          <code
            aria-labelledby="report-id-label"
            className="flex-1 select-all break-all rounded-lg border bg-card px-3 py-2.5 font-mono text-lg tracking-wider text-accent"
          >
            {reportId}
          </code>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={copy}
            aria-label="Copy report ID"
          >
            {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
          </Button>
        </div>
        <p className="mt-3 text-sm text-muted-foreground" aria-live="polite">
          {copied
            ? "Copied to clipboard."
            : "Save this ID now. It is the only way to check on your report and it cannot be recovered."}
        </p>
      </div>

      <div className="flex flex-col justify-center gap-3 sm:flex-row">
        <ButtonLink href={`/track-report?id=${reportId}`}>Track this report</ButtonLink>
        <Button type="button" variant="secondary" onClick={onReset}>
          Submit another report
        </Button>
      </div>
    </div>
  );
}
