"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarClock, MapPin, RefreshCw, Search, Tag } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import {
  REPORT_STATUS_LABELS,
  type ReportStatusValue,
  type ReportTypeValue,
} from "@/lib/constants";
import { cn, formatDate } from "@/lib/utils";
import { reportIdSchema } from "@/lib/validation";
import { StatusBadge, TypeBadge } from "./status-badge";

interface TrackedReport {
  reportId: string;
  type: ReportTypeValue;
  reportType: string;
  title: string;
  description: string;
  location: string | null;
  status: ReportStatusValue;
  createdAt: string;
  updatedAt: string;
}

type LookupState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "found"; report: TrackedReport }
  | { kind: "error"; message: string };

const PROGRESS: ReportStatusValue[] = ["PENDING", "IN_PROGRESS", "RESOLVED"];

function StatusProgress({ status }: { status: ReportStatusValue }) {
  if (status === "DISMISSED") {
    return (
      <Alert tone="info" title="Closed without further action">
        Moderators reviewed this report and closed it. If the situation continues, you can
        submit a new report.
      </Alert>
    );
  }
  const current = PROGRESS.indexOf(status);
  return (
    <ol className="grid grid-cols-3 gap-2" aria-label="Report progress">
      {PROGRESS.map((step, index) => {
        const reached = index <= current;
        return (
          <li
            key={step}
            className="space-y-2"
            aria-current={index === current ? "step" : undefined}
          >
            <div
              className={cn("h-1.5 rounded-full", reached ? "bg-primary" : "bg-muted")}
            />
            <p
              className={cn(
                "text-xs sm:text-sm",
                reached ? "font-medium" : "text-muted-foreground",
              )}
            >
              {REPORT_STATUS_LABELS[step]}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

export function ReportTracker() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [input, setInput] = useState(searchParams.get("id") ?? "");
  const [inputError, setInputError] = useState<string | undefined>();
  const [state, setState] = useState<LookupState>({ kind: "idle" });

  const lookup = useCallback(async (raw: string) => {
    const parsed = reportIdSchema.safeParse(raw);
    if (!parsed.success) {
      setInputError(raw.trim() ? parsed.error.issues[0].message : "Enter your report ID");
      return;
    }
    setInputError(undefined);
    setState({ kind: "loading" });
    try {
      const response = await fetch(`/api/reports/${parsed.data}`, { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setState({
          kind: "error",
          message:
            response.status === 404
              ? "We couldn't find a report with that ID. Check for typos and try again."
              : (data.error ?? "Something went wrong. Please try again."),
        });
        return;
      }
      setState({ kind: "found", report: data });
    } catch {
      setState({
        kind: "error",
        message: "Network error. Check your connection and try again.",
      });
    }
  }, []);

  // Support deep links such as /track-report?id=abc… from the confirmation screen.
  useEffect(() => {
    const id = searchParams.get("id");
    if (id) lookup(id);
  }, [searchParams, lookup]);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const normalized = input.trim().toLowerCase();
    if (reportIdSchema.safeParse(normalized).success) {
      router.replace(`${pathname}?id=${normalized}`, { scroll: false });
    }
    lookup(input);
  };

  return (
    <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[minmax(0,22rem)_1fr] lg:items-start">
      <Card className="p-5 sm:p-6">
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <Field
            id="report-id"
            label="Report ID"
            error={inputError}
            hint="16 characters, shown after you submitted."
          >
            {(props) => (
              <Input
                {...props}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="e.g. a1b2c3d4e5f60718"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                className="font-mono"
              />
            )}
          </Field>
          <Button type="submit" className="w-full" loading={state.kind === "loading"}>
            {state.kind !== "loading" && <Search aria-hidden="true" />}
            {state.kind === "loading" ? "Searching…" : "Track report"}
          </Button>
        </form>
      </Card>

      <section aria-live="polite" aria-label="Report status">
        {state.kind === "idle" && (
          <Card className="flex flex-col items-center justify-center gap-3 border-dashed p-10 text-center">
            <Search className="size-8 text-muted-foreground" aria-hidden="true" />
            <p className="font-medium">Enter your report ID to see its status</p>
            <p className="max-w-xs text-sm text-muted-foreground">
              Lost your ID? For your privacy it can&apos;t be recovered, but you can
              always submit a new report.
            </p>
          </Card>
        )}

        {state.kind === "loading" && (
          <Card className="space-y-4 p-6">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </Card>
        )}

        {state.kind === "error" && (
          <Alert tone="error" title="Report not found">
            {state.message}
          </Alert>
        )}

        {state.kind === "found" && (
          <Card className="animate-fade-up space-y-6 p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-xs text-muted-foreground">
                  {state.report.reportId}
                </p>
                <h2 className="mt-1 break-words text-xl font-semibold">
                  {state.report.title}
                </h2>
              </div>
              <StatusBadge status={state.report.status} />
            </div>

            <StatusProgress status={state.report.status} />

            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div className="flex gap-2">
                <Tag
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <div>
                  <dt className="text-muted-foreground">Category</dt>
                  <dd className="mt-0.5 flex flex-wrap items-center gap-2 font-medium">
                    {state.report.reportType} <TypeBadge type={state.report.type} />
                  </dd>
                </div>
              </div>
              <div className="flex gap-2">
                <CalendarClock
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <div>
                  <dt className="text-muted-foreground">Submitted</dt>
                  <dd className="mt-0.5 font-medium">
                    {formatDate(state.report.createdAt, true)}
                  </dd>
                </div>
              </div>
              <div className="flex gap-2">
                <RefreshCw
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <div>
                  <dt className="text-muted-foreground">Last updated</dt>
                  <dd className="mt-0.5 font-medium">
                    {formatDate(state.report.updatedAt, true)}
                  </dd>
                </div>
              </div>
              <div className="flex gap-2">
                <MapPin
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <dt className="text-muted-foreground">Location</dt>
                  <dd className="mt-0.5 break-words font-medium">
                    {state.report.location || "Not provided"}
                  </dd>
                </div>
              </div>
            </dl>

            <div className="border-t pt-4">
              <h3 className="text-sm text-muted-foreground">Description</h3>
              <p className="mt-1 whitespace-pre-line break-words leading-relaxed">
                {state.report.description}
              </p>
            </div>
          </Card>
        )}
      </section>
    </div>
  );
}
