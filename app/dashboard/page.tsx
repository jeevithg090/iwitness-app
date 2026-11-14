"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Inbox, LogOut, RefreshCw, Search } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { ReportCard, type DashboardReport } from "@/components/dashboard/report-card";
import {
  REPORT_STATUSES,
  REPORT_STATUS_LABELS,
  REPORT_TYPES,
  REPORT_TYPE_LABELS,
  type ReportStatusValue,
  type ReportTypeValue,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

type Counts = Record<ReportStatusValue, number>;

const STAT_STYLES: Record<ReportStatusValue, string> = {
  PENDING: "text-warning",
  IN_PROGRESS: "text-info",
  RESOLVED: "text-success",
  DISMISSED: "text-muted-foreground",
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [reports, setReports] = useState<DashboardReport[]>([]);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{
    tone: "success" | "error";
    text: string;
  } | null>(null);
  const [status, setStatus] = useState<ReportStatusValue | "ALL">("ALL");
  const [type, setType] = useState<ReportTypeValue | "ALL">("ALL");
  const [query, setQuery] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (status !== "ALL") params.set("status", status);
      if (type !== "ALL") params.set("type", type);
      const response = await fetch(`/api/reports?${params}`, { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "Failed to load reports");
      setReports(data.reports);
      setCounts(data.counts);
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Network error while loading reports."
          : (err as Error).message,
      );
    } finally {
      setLoading(false);
    }
  }, [status, type]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return reports;
    return reports.filter((r) =>
      [r.title, r.description, r.location ?? "", r.reportId, r.reportType].some((value) =>
        value.toLowerCase().includes(q),
      ),
    );
  }, [reports, query]);

  const updateStatus = async (report: DashboardReport, next: ReportStatusValue) => {
    const previous = report.status;
    setUpdating(report.reportId);
    setNotice(null);
    // Optimistic update, rolled back on failure.
    setReports((list) =>
      list.map((r) => (r.reportId === report.reportId ? { ...r, status: next } : r)),
    );
    try {
      const response = await fetch(`/api/reports/${report.reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Could not update the report");
      }
      setCounts((c) =>
        c ? { ...c, [previous]: c[previous] - 1, [next]: c[next] + 1 } : c,
      );
      setNotice({
        tone: "success",
        text: `“${report.title}” marked as ${REPORT_STATUS_LABELS[next].toLowerCase()}.`,
      });
      if (status !== "ALL" && next !== status) {
        setReports((list) => list.filter((r) => r.reportId !== report.reportId));
      }
    } catch (err) {
      setReports((list) =>
        list.map((r) =>
          r.reportId === report.reportId ? { ...r, status: previous } : r,
        ),
      );
      setNotice({ tone: "error", text: (err as Error).message });
    } finally {
      setUpdating(null);
    }
  };

  const total = counts ? Object.values(counts).reduce((sum, n) => sum + n, 0) : 0;

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Moderator dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Signed in as {session?.user?.name ?? "staff"}
            {session?.user?.role ? ` · ${session.user.role.toLowerCase()}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={fetchReports} loading={loading}>
            {!loading && <RefreshCw aria-hidden="true" />}
            Refresh
          </Button>
          <Button variant="ghost" onClick={() => signOut({ callbackUrl: "/" })}>
            <LogOut aria-hidden="true" />
            Sign out
          </Button>
        </div>
      </div>

      <section
        aria-label="Report totals"
        className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        {REPORT_STATUSES.map((s) => (
          <Card key={s} className="p-4 sm:p-5">
            <p className="text-sm text-muted-foreground">{REPORT_STATUS_LABELS[s]}</p>
            {counts ? (
              <p
                className={cn("mt-1 text-3xl font-semibold tabular-nums", STAT_STYLES[s])}
              >
                {counts[s]}
              </p>
            ) : (
              <Skeleton className="mt-2 h-8 w-12" />
            )}
          </Card>
        ))}
      </section>

      <section
        aria-label="Filters"
        className="mt-8 grid gap-3 sm:grid-cols-[1fr_auto_auto]"
      >
        <div className="relative">
          <label htmlFor="report-search" className="sr-only">
            Search reports
          </label>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="report-search"
            type="search"
            placeholder="Search title, description, location or ID"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="pl-9"
          />
        </div>
        <div>
          <label htmlFor="filter-status" className="sr-only">
            Filter by status
          </label>
          <Select
            id="filter-status"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as ReportStatusValue | "ALL")
            }
          >
            <option value="ALL">All statuses</option>
            {REPORT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {REPORT_STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label htmlFor="filter-type" className="sr-only">
            Filter by urgency
          </label>
          <Select
            id="filter-type"
            value={type}
            onChange={(event) => setType(event.target.value as ReportTypeValue | "ALL")}
          >
            <option value="ALL">All urgencies</option>
            {REPORT_TYPES.map((t) => (
              <option key={t} value={t}>
                {REPORT_TYPE_LABELS[t]}
              </option>
            ))}
          </Select>
        </div>
      </section>

      <div className="mt-4 flex min-h-6 items-center justify-between text-sm text-muted-foreground">
        <p aria-live="polite">
          {!loading &&
            !error &&
            `Showing ${visible.length} of ${total} report${total === 1 ? "" : "s"}`}
        </p>
      </div>

      <div aria-live="polite" className="empty:hidden">
        {notice && (
          <Alert tone={notice.tone} className="mt-2">
            {notice.text}
          </Alert>
        )}
      </div>

      <div className="mt-4 grid gap-4">
        {loading &&
          reports.length === 0 &&
          Array.from({ length: 3 }, (_, i) => (
            <Card key={i} className="space-y-3 p-6">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </Card>
          ))}

        {error && (
          <Alert tone="error" title="Could not load reports">
            <p>{error}</p>
            <Button variant="link" className="mt-1 text-sm" onClick={fetchReports}>
              Try again
            </Button>
          </Alert>
        )}

        {!loading && !error && visible.length === 0 && (
          <Card className="flex flex-col items-center gap-2 border-dashed p-12 text-center">
            <Inbox className="size-8 text-muted-foreground" aria-hidden="true" />
            <p className="font-medium">No reports match these filters</p>
            <p className="text-sm text-muted-foreground">
              Try clearing the search or choosing another status.
            </p>
          </Card>
        )}

        {!error &&
          visible.map((report) => (
            <ReportCard
              key={report.reportId}
              report={report}
              updating={updating === report.reportId}
              onStatusChange={updateStatus}
            />
          ))}
      </div>
    </div>
  );
}
