import { ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";

export function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="container flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center py-12">
      <div className="text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <ShieldCheck className="size-6" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>
      <Card className="mt-8 p-6 sm:p-8">{children}</Card>
      {footer && (
        <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>
      )}
    </div>
  );
}
