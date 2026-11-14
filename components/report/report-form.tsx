"use client";

import { useRef, useState } from "react";
import { AlertTriangle, ImagePlus, Info, Loader2, Send, Sparkles, X } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { INCIDENT_CATEGORIES, type ReportTypeValue } from "@/lib/constants";
import { prepareImage } from "@/lib/image-client";
import { cn } from "@/lib/utils";
import { createReportSchema, fieldErrors } from "@/lib/validation";
import { LocationInput } from "./location-input";

interface FormState {
  type: ReportTypeValue | "";
  category: string;
  title: string;
  description: string;
  location: string;
}

type AnalysisState =
  | { kind: "idle" }
  | { kind: "processing" }
  | { kind: "analyzing" }
  | { kind: "done" }
  | { kind: "error"; message: string };

const INITIAL: FormState = {
  type: "",
  category: "",
  title: "",
  description: "",
  location: "",
};

const FIELD_ORDER = ["type", "category", "title", "description", "location"] as const;

const TYPE_OPTIONS = [
  {
    value: "EMERGENCY" as const,
    label: "Emergency",
    hint: "Happening now, needs immediate response",
    icon: AlertTriangle,
    selected: "border-destructive bg-destructive/10 ring-2 ring-destructive/30",
    iconClass: "text-destructive",
  },
  {
    value: "NON_EMERGENCY" as const,
    label: "Non-emergency",
    hint: "Already happened or ongoing concern",
    icon: Info,
    selected: "border-warning bg-warning/10 ring-2 ring-warning/30",
    iconClass: "text-warning",
  },
];

export function ReportForm({ onSubmitted }: { onSubmitted: (reportId: string) => void }) {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(
    null,
  );
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisState>({ kind: "idle" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(({ [key]: _removed, ...rest }) => rest);
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setAnalysis({ kind: "processing" });
    let dataUrl: string;
    try {
      dataUrl = await prepareImage(file);
      setImage(dataUrl);
    } catch (error) {
      setAnalysis({ kind: "error", message: (error as Error).message });
      return;
    }

    setAnalysis({ kind: "analyzing" });
    try {
      const response = await fetch("/api/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setAnalysis({
          kind: "error",
          message: data.error ?? "Photo analysis is unavailable.",
        });
        return;
      }
      // Only fill fields the reporter hasn't written themselves.
      setForm((prev) => ({
        ...prev,
        title: prev.title || data.title || "",
        description: prev.description || data.description || "",
        category: prev.category || data.category || "",
      }));
      setErrors({});
      setAnalysis({ kind: "done" });
    } catch {
      setAnalysis({
        kind: "error",
        message: "Photo analysis failed. You can still fill in the details.",
      });
    }
  };

  const removeImage = () => {
    setImage(null);
    setAnalysis({ kind: "idle" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const focusFirstError = (fields: Record<string, string>) => {
    const first = FIELD_ORDER.find((key) => fields[key]);
    if (!first) return;
    const target =
      first === "type"
        ? formRef.current?.querySelector<HTMLElement>('input[name="type"]')
        : formRef.current?.querySelector<HTMLElement>(`#report-${first}`);
    target?.focus();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);

    const payload = {
      type: form.type || undefined,
      category: form.category || undefined,
      title: form.title,
      description: form.description,
      location: form.location,
      latitude: coords?.latitude ?? null,
      longitude: coords?.longitude ?? null,
      image,
    };

    const parsed = createReportSchema.safeParse(payload);
    if (!parsed.success) {
      const fields = fieldErrors(parsed.error);
      setErrors(fields);
      focusFirstError(fields);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (data.fields) {
          setErrors(data.fields);
          focusFirstError(data.fields);
        }
        throw new Error(data.error ?? "We could not submit your report.");
      }
      onSubmitted(data.reportId);
    } catch (error) {
      setSubmitError(
        error instanceof TypeError
          ? "Network error. Check your connection and try again."
          : (error as Error).message,
      );
    } finally {
      setSubmitting(false);
    }
  };

  const busy = analysis.kind === "processing" || analysis.kind === "analyzing";

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-7">
      {submitError && (
        <Alert tone="error" title="Report not submitted">
          {submitError}
        </Alert>
      )}

      <fieldset aria-describedby={errors.type ? "report-type-error" : undefined}>
        <legend className="mb-2 text-sm font-medium">How urgent is it?</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {TYPE_OPTIONS.map(({ value, label, hint, icon: Icon, selected, iconClass }) => (
            <label
              key={value}
              className={cn(
                "relative flex cursor-pointer items-start gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-muted-foreground/50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                form.type === value && selected,
                errors.type && "border-destructive",
              )}
            >
              <input
                type="radio"
                name="type"
                value={value}
                checked={form.type === value}
                onChange={() => update("type", value)}
                className="sr-only"
              />
              <Icon
                className={cn("mt-0.5 size-5 shrink-0", iconClass)}
                aria-hidden="true"
              />
              <span>
                <span className="block font-medium">{label}</span>
                <span className="block text-sm text-muted-foreground">{hint}</span>
              </span>
            </label>
          ))}
        </div>
        {errors.type && (
          <p
            id="report-type-error"
            role="alert"
            className="mt-1.5 text-sm text-destructive"
          >
            {errors.type}
          </p>
        )}
      </fieldset>

      <div className="space-y-2">
        <div className="flex items-baseline gap-2 text-sm font-medium">
          Photo
          <span className="text-xs font-normal text-muted-foreground">Optional</span>
        </div>
        <input
          ref={fileInputRef}
          id="report-photo"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          className="peer sr-only"
          onChange={(event) => handleFile(event.target.files?.[0])}
          aria-describedby="report-photo-hint"
          disabled={busy}
        />
        {image ? (
          <div className="relative overflow-hidden rounded-xl border bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element -- local data URL preview */}
            <img
              src={image}
              alt="Selected photo preview"
              className="max-h-72 w-full object-contain"
            />
            {busy && (
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-background/70 text-sm font-medium backdrop-blur-sm">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Analysing photo…
              </div>
            )}
            <div className="flex flex-wrap items-center justify-end gap-2 border-t bg-card p-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={busy}
              >
                <ImagePlus aria-hidden="true" />
                Replace
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={removeImage}
                disabled={busy}
              >
                <X aria-hidden="true" />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <label
            htmlFor="report-photo"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              handleFile(event.dataTransfer.files?.[0]);
            }}
            className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-input bg-card/50 px-4 py-8 text-center transition-colors hover:border-accent/60 hover:bg-accent/5 peer-focus-visible:ring-2 peer-focus-visible:ring-ring"
          >
            {busy ? (
              <Loader2
                className="size-8 animate-spin text-muted-foreground"
                aria-hidden="true"
              />
            ) : (
              <ImagePlus className="size-8 text-muted-foreground" aria-hidden="true" />
            )}
            <span className="text-sm font-medium">Add a photo or drop it here</span>
            <span className="text-xs text-muted-foreground">JPEG, PNG or WebP</span>
          </label>
        )}
        <p id="report-photo-hint" className="text-xs text-muted-foreground">
          The photo is resized in your browser and location metadata is removed before
          upload.
        </p>
        <div aria-live="polite">
          {analysis.kind === "done" && (
            <Alert tone="success" title="Draft filled from your photo">
              <Sparkles className="mr-1 inline size-3.5" aria-hidden="true" />
              Review the category, title and description below before submitting.
            </Alert>
          )}
          {analysis.kind === "error" && <Alert tone="info">{analysis.message}</Alert>}
        </div>
      </div>

      <Field id="report-category" label="Category" error={errors.category}>
        {(props) => (
          <Select
            {...props}
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
          >
            <option value="">Select a category</option>
            {INCIDENT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        )}
      </Field>

      <Field
        id="report-title"
        label="Title"
        error={errors.title}
        hint="A short summary, e.g. “Car break-in on Elm Street”"
      >
        {(props) => (
          <Input
            {...props}
            value={form.title}
            maxLength={120}
            onChange={(e) => update("title", e.target.value)}
          />
        )}
      </Field>

      <Field
        id="report-description"
        label="What happened?"
        error={errors.description}
        hint={`${form.description.length}/5000 · Include what, when and who was involved. Avoid details that identify you.`}
      >
        {(props) => (
          <Textarea
            {...props}
            rows={5}
            value={form.description}
            maxLength={5000}
            onChange={(e) => update("description", e.target.value)}
          />
        )}
      </Field>

      <Field
        id="report-location"
        label="Location"
        optional
        error={errors.location}
        hint="Type an address or use the locate button."
      >
        {({ id, ...props }) => (
          <LocationInput
            id={id}
            value={form.location}
            onChange={(value) => update("location", value)}
            onCoordinatesChange={setCoords}
            describedBy={props["aria-describedby"]}
          />
        )}
      </Field>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        loading={submitting}
        disabled={busy}
      >
        {!submitting && <Send aria-hidden="true" />}
        {submitting ? "Submitting…" : "Submit report anonymously"}
      </Button>
    </form>
  );
}
