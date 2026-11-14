"use client";

import { useState } from "react";
import { CalendarClock, ExternalLink, ImageIcon, MapPin, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/field";
import { StatusBadge, TypeBadge } from "@/components/report/status-badge";
import {
  REPORT_STATUSES,
  REPORT_STATUS_LABELS,
  type ReportStatusValue,
} from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export interface DashboardReport {
  id: string;
  reportId: string;
  type: "EMERGENCY" | "NON_EMERGENCY";
  reportType: string;
  title: string;
  description: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  status: ReportStatusValue;
  createdAt: string;
  updatedAt: string;
  hasImage: boolean;
}

interface ReportCardProps {
  report: DashboardReport;
  updating: boolean;
  onStatusChange: (report: DashboardReport, status: ReportStatusValue) => void;
}

export function ReportCard({ report, updating, onStatusChange }: ReportCardProps) {
  const [showImage, setShowImage] = useState(false);
  const selectId = `status-${report.reportId}`;
  const hasCoords = report.latitude !== null && report.longitude !== null;

  return (
    <Card className="p-5 transition-colors hover:border-muted-foreground/40 sm:p-6">
      <article className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <TypeBadge type={report.type} />
            <StatusBadge status={report.status} />
            <span className="font-mono text-xs text-muted-foreground">
              #{report.reportId}
            </span>
          </div>
          <h2 className="break-words text-lg font-semibold">{report.title}</h2>
          <p className="whitespace-pre-line break-words text-sm leading-relaxed text-muted-foreground">
            {report.description}
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-1.5">
              <Tag className="size-4" aria-hidden="true" />
              {report.reportType}
            </li>
            <li className="flex min-w-0 items-center gap-1.5">
              <MapPin className="size-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{report.location || "No location"}</span>
              {hasCoords && (
                <a
                  href={`https://www.openstreetmap.org/?mlat=${report.latitude}&mlon=${report.longitude}#map=17/${report.latitude}/${report.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-accent hover:underline"
                >
                  Map
                  <ExternalLink className="size-3" aria-hidden="true" />
                  <span className="sr-only">(opens in new tab)</span>
                </a>
              )}
            </li>
            <li className="flex items-center gap-1.5">
              <CalendarClock className="size-4" aria-hidden="true" />
              <time dateTime={report.createdAt}>
                {formatDate(report.createdAt, true)}
              </time>
            </li>
          </ul>
          {report.hasImage && (
            <div>
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3"
                onClick={() => setShowImage((value) => !value)}
                aria-expanded={showImage}
              >
                <ImageIcon aria-hidden="true" />
                {showImage ? "Hide photo" : "Show photo"}
              </Button>
              {showImage && (
                // eslint-disable-next-line @next/next/no-img-element -- authenticated API route, not optimisable
                <img
                  src={`/api/reports/${report.reportId}/image`}
                  alt={`Photo attached to report: ${report.title}`}
                  loading="lazy"
                  className="mt-2 max-h-80 rounded-lg border object-contain"
                />
              )}
            </div>
          )}
        </div>

        <div className="w-full shrink-0 space-y-1.5 md:w-48">
          <label htmlFor={selectId} className="text-sm font-medium">
            Status
          </label>
          <Select
            id={selectId}
            value={report.status}
            disabled={updating}
            onChange={(event) =>
              onStatusChange(report, event.target.value as ReportStatusValue)
            }
          >
            {REPORT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {REPORT_STATUS_LABELS[status]}
              </option>
            ))}
          </Select>
        </div>
      </article>
    </Card>
  );
}
