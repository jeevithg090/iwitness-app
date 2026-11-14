import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  eyebrow: string;
  icon: LucideIcon;
  title: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
}

/** Centered page intro used by the public pages. */
export function PageHeader({
  eyebrow,
  icon: Icon,
  title,
  description,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "mx-auto flex max-w-2xl flex-col items-center text-center",
        className,
      )}
    >
      <span className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3.5 py-1.5 text-sm font-medium text-accent">
        <Icon className="size-4" aria-hidden="true" />
        {eyebrow}
      </span>
      <h1 className="mt-6 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
        {title}
      </h1>
      {description && (
        <p className="mt-4 text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
          {description}
        </p>
      )}
    </header>
  );
}
