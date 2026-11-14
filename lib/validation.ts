import { z } from "zod";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  INCIDENT_CATEGORIES,
  MAX_IMAGE_DATA_URL_LENGTH,
  REPORT_STATUSES,
  REPORT_ID_PATTERN,
  REPORT_TYPES,
} from "./constants";

const imageDataUrl = z
  .string()
  .max(MAX_IMAGE_DATA_URL_LENGTH, "Image is too large (max ≈3 MB)")
  .refine(
    (value) =>
      ALLOWED_IMAGE_MIME_TYPES.some((mime) => value.startsWith(`data:${mime};base64,`)),
    "Image must be a JPEG, PNG or WebP data URL",
  );

const optionalTrimmed = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value ? value : null));

export const createReportSchema = z.object({
  type: z.enum(REPORT_TYPES, { error: "Choose emergency or non-emergency" }),
  category: z.enum(INCIDENT_CATEGORIES, { error: "Choose an incident category" }),
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(120, "Title must be 120 characters or fewer"),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must be 5000 characters or fewer"),
  location: optionalTrimmed(300),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  image: imageDataUrl.nullable().optional(),
});

export type CreateReportInput = z.input<typeof createReportSchema>;

export const updateStatusSchema = z.object({
  status: z.enum(REPORT_STATUSES, { error: "Unknown status" }),
});

export const reportIdSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(REPORT_ID_PATTERN, "Report IDs are 16 characters (0-9, a-f)");

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address")),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be 72 characters or fewer"),
});

export const analyzeImageSchema = z.object({ image: imageDataUrl });

export const reportFiltersSchema = z.object({
  status: z.enum(REPORT_STATUSES).optional(),
  type: z.enum(REPORT_TYPES).optional(),
});

/** Turns zod issues into a `{ field: message }` map suitable for form UIs. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    result[key] ??= issue.message;
  }
  return result;
}
