import * as React from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const tones = {
  error: {
    icon: AlertCircle,
    className: "border-destructive/30 bg-destructive/5 text-destructive",
  },
  success: {
    icon: CheckCircle2,
    className: "border-success/30 bg-success/5 text-success",
  },
  info: { icon: Info, className: "border-info/30 bg-info/5 text-info" },
};

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: keyof typeof tones;
  title?: string;
}

export function Alert({
  tone = "info",
  title,
  className,
  children,
  ...props
}: AlertProps) {
  const { icon: Icon, className: toneClass } = tones[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("flex gap-3 rounded-lg border p-3.5 text-sm", toneClass, className)}
      {...props}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="space-y-0.5">
        {title && <p className="font-medium">{title}</p>}
        <div className="text-foreground/80">{children}</div>
      </div>
    </div>
  );
}
