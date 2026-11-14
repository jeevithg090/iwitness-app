import { randomBytes } from "node:crypto";
import { REPORT_ID_PATTERN } from "./constants";

export { REPORT_ID_PATTERN };

/**
 * Generates an unguessable tracking ID for an anonymous report.
 * The ID is the only credential a reporter has to check on their report, so it
 * must come from a CSPRNG and is generated on the server, never by the client.
 */
export function generateReportId(): string {
  return randomBytes(8).toString("hex");
}

/** Normalises user input (whitespace, upper-case) before validation. */
export function normalizeReportId(input: string): string {
  return input.trim().toLowerCase();
}

export function isValidReportId(input: string): boolean {
  return REPORT_ID_PATTERN.test(input);
}
