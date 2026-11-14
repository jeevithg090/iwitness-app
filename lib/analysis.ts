import { INCIDENT_CATEGORIES, type IncidentCategory } from "./constants";

export const ANALYSIS_PROMPT = `You are helping someone file an incident report from a photo.
Respond in exactly this format, plain text, no markdown, asterisks or bullet points:
TITLE: a clear, brief title (max 12 words)
TYPE: exactly one of ${INCIDENT_CATEGORIES.join(", ")}
DESCRIPTION: a factual, concise description of what is visible (2-4 sentences)`;

export interface ImageAnalysis {
  title: string;
  category: IncidentCategory;
  description: string;
}

/** Maps free-form model output to one of the known categories (case-insensitive). */
export function matchCategory(raw: string | undefined): IncidentCategory {
  const value = raw?.trim().toLowerCase() ?? "";
  const exact = INCIDENT_CATEGORIES.find((c) => c.toLowerCase() === value);
  if (exact) return exact;
  const partial = INCIDENT_CATEGORIES.find(
    (c) => c !== "Other" && value.includes(c.toLowerCase()),
  );
  return partial ?? "Other";
}

/**
 * Parses the model response into structured fields. Returns null when the
 * response does not contain at least a title and description.
 */
export function parseAnalysis(text: string): ImageAnalysis | null {
  const clean = text.replace(/\*+/g, "");
  const field = (name: string) =>
    clean.match(new RegExp(`^\\s*${name}\\s*:\\s*(.+)$`, "im"))?.[1]?.trim();

  // DESCRIPTION may span multiple lines: take everything after the label.
  const descriptionMatch = clean.match(/^\s*DESCRIPTION\s*:\s*([\s\S]+)$/im);
  const description = descriptionMatch?.[1]?.trim().replace(/\s+/g, " ");
  const title = field("TITLE");

  if (!title || !description) return null;

  return {
    title: title.slice(0, 120),
    category: matchCategory(field("TYPE")),
    description: description.slice(0, 5000),
  };
}

/** Splits a `data:<mime>;base64,<data>` URL into its parts. */
export function splitDataUrl(dataUrl: string): { mimeType: string; data: string } | null {
  const match = dataUrl.match(/^data:([a-z]+\/[a-z0-9.+-]+);base64,(.+)$/i);
  if (!match) return null;
  return { mimeType: match[1].toLowerCase(), data: match[2] };
}
