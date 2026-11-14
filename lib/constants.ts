/** Shared domain constants used by both the client and the API. */

export const INCIDENT_CATEGORIES = [
  "Theft",
  "Fire Outbreak",
  "Medical Emergency",
  "Natural Disaster",
  "Violence",
  "Other",
] as const;

export type IncidentCategory = (typeof INCIDENT_CATEGORIES)[number];

export const REPORT_TYPES = ["EMERGENCY", "NON_EMERGENCY"] as const;
export type ReportTypeValue = (typeof REPORT_TYPES)[number];

export const REPORT_STATUSES = [
  "PENDING",
  "IN_PROGRESS",
  "RESOLVED",
  "DISMISSED",
] as const;
export type ReportStatusValue = (typeof REPORT_STATUSES)[number];

export const STAFF_ROLES = ["ADMIN", "MODERATOR"] as const;

export const REPORT_TYPE_LABELS: Record<ReportTypeValue, string> = {
  EMERGENCY: "Emergency",
  NON_EMERGENCY: "Non-emergency",
};

export const REPORT_STATUS_LABELS: Record<ReportStatusValue, string> = {
  PENDING: "Pending review",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
  DISMISSED: "Dismissed",
};

/** Max size of an uploaded image once encoded as a data URL (≈ 3 MB of binary data). */
export const MAX_IMAGE_DATA_URL_LENGTH = 4_000_000;

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

/** Report IDs are 16 lowercase hex characters (64 bits of randomness). */
export const REPORT_ID_PATTERN = /^[a-f0-9]{16}$/;
