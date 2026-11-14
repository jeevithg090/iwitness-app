import { Badge } from "@/components/ui/badge";
import {
  REPORT_STATUS_LABELS,
  REPORT_TYPE_LABELS,
  type ReportStatusValue,
  type ReportTypeValue,
} from "@/lib/constants";

const STATUS_TONES = {
  PENDING: "warning",
  IN_PROGRESS: "info",
  RESOLVED: "success",
  DISMISSED: "neutral",
} as const;

export function StatusBadge({ status }: { status: ReportStatusValue }) {
  return (
    <Badge tone={STATUS_TONES[status]}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {REPORT_STATUS_LABELS[status]}
    </Badge>
  );
}

export function TypeBadge({ type }: { type: ReportTypeValue }) {
  return (
    <Badge tone={type === "EMERGENCY" ? "danger" : "accent"}>
      {REPORT_TYPE_LABELS[type]}
    </Badge>
  );
}
